import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { gearhubApiClientOptions } from "../../api/clientOptions";
import {
  getApiEquipmentIdQueryKey,
  getApiEquipmentQueryKey,
  useGetApiBrand,
  useGetApiCategory,
  useGetApiEquipmentId,
  useGetApiWarehouse,
  usePostApiEquipment,
  usePutApiEquipmentId,
} from "../../api/generated/react-query";
import {
  equipmentFormSchema,
  type EquipmentFormValues,
} from "../../lib/formSchemas";
import type { WarehouseOption } from "../../lib/warehouseOptionsFromEquipment";

export type UseEquipmentUpsertOptions = {
  equipmentId?: number;
};

export function useEquipmentUpsert({
  equipmentId,
}: UseEquipmentUpsertOptions = {}) {
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const isEdit =
    equipmentId != null && Number.isFinite(equipmentId) && equipmentId > 0;
  const detailId = isEdit ? equipmentId! : 0;

  const primedCreateDefaults = useRef(false);
  const editResetKey = useRef<number | null>(null);

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      name: "",
      categoryId: 1,
      brandId: 1,
      warehouseId: 1,
      dailyRate: 100,
      isAvailable: true,
      imageUrl: "",
    },
  });

  const equipmentDetail = useGetApiEquipmentId(detailId, {
    client: gearhubApiClientOptions,
    query: { enabled: isEdit },
  });
  const categories = useGetApiCategory({ client: gearhubApiClientOptions });
  const brands = useGetApiBrand({ client: gearhubApiClientOptions });
  const warehouseQuery = useGetApiWarehouse({ client: gearhubApiClientOptions });

  const warehouses = useMemo((): WarehouseOption[] => {
    const fromList: WarehouseOption[] = (warehouseQuery.data ?? [])
      .filter((w) => w.id != null)
      .map((w) => ({ id: w.id!, name: w.name?.trim() || `Warehouse #${w.id}` }));
    if (!isEdit || !equipmentDetail.data) return fromList;
    const wid = equipmentDetail.data.warehouseId;
    if (wid == null) return fromList;
    if (fromList.some((w) => w.id === wid)) return fromList;
    return [
      {
        id: wid,
        name: equipmentDetail.data.warehouseName ?? `Warehouse #${wid}`,
      },
      ...fromList,
    ];
  }, [warehouseQuery.data, isEdit, equipmentDetail.data]);

  useEffect(() => {
    if (isEdit) {
      primedCreateDefaults.current = false;
      return;
    }
    if (primedCreateDefaults.current) return;
    const c0 = categories.data?.[0]?.id;
    const b0 = brands.data?.[0]?.id;
    const w0 = warehouses[0]?.id;
    if (c0 == null || b0 == null || w0 == null) return;
    primedCreateDefaults.current = true;
    form.setValue("categoryId", c0);
    form.setValue("brandId", b0);
    form.setValue("warehouseId", w0);
  }, [isEdit, categories.data, brands.data, warehouses, form]);

  useEffect(() => {
    if (!isEdit) {
      editResetKey.current = null;
      return;
    }
    const d = equipmentDetail.data;
    if (!d?.id) return;
    if (editResetKey.current === d.id) return;
    editResetKey.current = d.id;
    form.reset({
      name: d.name ?? "",
      categoryId: d.categoryId ?? 1,
      brandId: d.brandId ?? 1,
      warehouseId: d.warehouseId ?? 1,
      dailyRate: d.dailyRate ?? 0,
      isAvailable: d.isAvailable ?? true,
      imageUrl: d.imageUrl ?? "",
    });
  }, [isEdit, equipmentDetail.data, form]);

  const create = usePostApiEquipment({
    client: gearhubApiClientOptions,
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getApiEquipmentQueryKey() });
        enqueueSnackbar("Equipment added.", { variant: "success" });
        void navigate({ to: "/intranet/equipment" });
      },
      onError: (e) => {
        enqueueSnackbar(String((e as Error)?.message ?? e), {
          variant: "error",
        });
      },
    },
  });

  const update = usePutApiEquipmentId({
    client: gearhubApiClientOptions,
    mutation: {
      onSuccess: (_res, vars) => {
        qc.invalidateQueries({ queryKey: getApiEquipmentQueryKey() });
        qc.invalidateQueries({ queryKey: getApiEquipmentIdQueryKey(vars.id) });
        enqueueSnackbar("Equipment updated.", { variant: "success" });
      },
      onError: (e) => {
        enqueueSnackbar(String((e as Error)?.message ?? e), {
          variant: "error",
        });
      },
    },
  });

  const handleSubmitForm = form.handleSubmit((data) => {
    if (isEdit) {
      update.mutate(
        { id: detailId, data },
        {
          onSuccess: () => {
            qc.invalidateQueries({ queryKey: getApiEquipmentQueryKey() });
            qc.invalidateQueries({
              queryKey: getApiEquipmentIdQueryKey(detailId),
            });
            navigate({ to: "/intranet/equipment" });
          },
        },
      );
    } else {
      create.mutate({ data });
    }
  });

  const isLoading =
    warehouseQuery.isLoading ||
    categories.isLoading ||
    brands.isLoading ||
    (isEdit && equipmentDetail.isLoading);

  const isDetailError = isEdit && equipmentDetail.isError;
  const isDetailMissing =
    isEdit && equipmentDetail.isSuccess && equipmentDetail.data?.id == null;

  return {
    categories,
    brands,
    warehouses,
    create,
    update,
    form,
    handleSubmitForm,
    isLoading,
    isEdit,
    isDetailError,
    isDetailMissing,
  };
}
