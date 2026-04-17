import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { gearhubApiClientOptions } from "../../api/clientOptions";
import {
  getApiEquipmentQueryKey,
  useDeleteApiEquipmentId,
  useGetApiBrand,
  useGetApiCategory,
  useGetApiEquipment,
  usePostApiEquipment,
} from "../../api/generated/react-query";
import { equipmentFormSchema, type EquipmentFormValues } from "../../lib/formSchemas";
import { warehouseOptionsFromEquipment } from "../../lib/warehouseOptionsFromEquipment";

export function useEquipmentAdmin() {
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const primedDefaults = useRef(false);

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      name: "",
      categoryId: 1,
      brandId: 1,
      warehouseId: 1,
      dailyRate: 100,
      isAvailable: true,
    },
  });

  const equipment = useGetApiEquipment({ client: gearhubApiClientOptions });
  const categories = useGetApiCategory({ client: gearhubApiClientOptions });
  const brands = useGetApiBrand({ client: gearhubApiClientOptions });
  const warehouses = useMemo(
    () => warehouseOptionsFromEquipment(equipment.data),
    [equipment.data],
  );

  useEffect(() => {
    if (primedDefaults.current) return;
    const c0 = categories.data?.[0]?.id;
    const b0 = brands.data?.[0]?.id;
    const w0 = warehouses[0]?.id;
    if (c0 == null || b0 == null || w0 == null) return;
    primedDefaults.current = true;
    form.setValue("categoryId", c0);
    form.setValue("brandId", b0);
    form.setValue("warehouseId", w0);
  }, [categories.data, brands.data, warehouses, form]);

  const create = usePostApiEquipment({
    client: gearhubApiClientOptions,
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getApiEquipmentQueryKey() });
        enqueueSnackbar("Equipment added.", { variant: "success" });
        form.reset({
          name: "",
          categoryId: form.getValues("categoryId"),
          brandId: form.getValues("brandId"),
          warehouseId: form.getValues("warehouseId"),
          dailyRate: 100,
          isAvailable: true,
        });
      },
      onError: (e) => {
        enqueueSnackbar(String((e as Error)?.message ?? e), { variant: "error" });
      },
    },
  });

  const remove = useDeleteApiEquipmentId({
    client: gearhubApiClientOptions,
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getApiEquipmentQueryKey() });
        enqueueSnackbar("Equipment removed.", { variant: "info" });
      },
      onError: (e) => {
        enqueueSnackbar(String((e as Error)?.message ?? e), { variant: "error" });
      },
    },
  });

  const handleSubmitForm = form.handleSubmit((data) => {
    create.mutate({ data });
  });

  return { equipment, categories, brands, warehouses, create, remove, form, handleSubmitForm };
}
