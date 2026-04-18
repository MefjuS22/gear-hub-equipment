import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { gearhubApiClientOptions } from "../../api/clientOptions";
import {
  getApiEquipmentQueryKey,
  useGetApiBrand,
  useGetApiCategory,
  useGetApiEquipment,
  usePostApiEquipment,
} from "../../api/generated/react-query";
import {
  equipmentFormSchema,
  type EquipmentFormValues,
} from "../../lib/formSchemas";
import { warehouseOptionsFromEquipment } from "../../lib/warehouseOptionsFromEquipment";

export function useEquipmentCreate() {
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const navigate = useNavigate();
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
        void navigate({ to: "/intranet/equipment" });
      },
      onError: (e) => {
        enqueueSnackbar(String((e as Error)?.message ?? e), {
          variant: "error",
        });
      },
    },
  });

  const handleSubmitForm = form.handleSubmit((data) => {
    create.mutate({ data });
  });

  const isLoading =
    equipment.isLoading || categories.isLoading || brands.isLoading;

  return {
    categories,
    brands,
    warehouses,
    create,
    form,
    handleSubmitForm,
    isLoading,
  };
}
