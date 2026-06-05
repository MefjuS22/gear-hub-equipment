import { useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Text, TextInput } from "react-native-paper";

import { generatedClientConfig } from "../../api/generatedConfig";
import { postApiWarehouseMutationRequestSchema } from "../../api/generated/zod";
import {
  getApiWarehouseQueryKey,
  useGetApiWarehouseId,
  usePostApiWarehouse,
  usePutApiWarehouseId,
} from "../../api/generated/react-query";
import type {
  PostApiWarehouseMutationRequest,
  PutApiWarehouseIdMutationRequest,
} from "../../api/generated/types";
import { ScreenShell } from "../../components/ScreenShell";
import type { CatalogStackParamList } from "../../navigation/navigationTypes";
import { handleApiError } from "../../lib/apiError";
import { useAppToast } from "../../providers/AppToastProvider";

type Props = NativeStackScreenProps<CatalogStackParamList, "WarehouseForm">;

const warehouseFormSchema = postApiWarehouseMutationRequestSchema.superRefine((data, ctx) => {
  if (!String(data.name ?? "").trim()) {
    ctx.addIssue({
      code: "custom",
      message: "Name is required.",
      path: ["name"],
    });
  }
  if (!String(data.location ?? "").trim()) {
    ctx.addIssue({
      code: "custom",
      message: "Location is required.",
      path: ["location"],
    });
  }
});

type FormValues = PostApiWarehouseMutationRequest;

export const WarehouseFormScreen = ({ navigation, route }: Props) => {
  const warehouseId = route.params?.warehouseId;
  const isEdit = warehouseId != null;
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useAppToast();

  const detailQuery = useGetApiWarehouseId(warehouseId ?? 0, {
    client: generatedClientConfig,
    query: { enabled: isEdit },
  });

  const createMutation = usePostApiWarehouse({ client: generatedClientConfig });
  const updateMutation = usePutApiWarehouseId({ client: generatedClientConfig });

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: { name: "", location: "" },
  });

  useEffect(() => {
    if (detailQuery.data) {
      reset({
        name: detailQuery.data.name ?? "",
        location: detailQuery.data.location ?? "",
      });
    }
  }, [detailQuery.data, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload: PostApiWarehouseMutationRequest | PutApiWarehouseIdMutationRequest = {
      name: (values.name ?? "").trim(),
      location: (values.location ?? "").trim(),
    };
    try {
      if (isEdit && warehouseId != null) {
        await updateMutation.mutateAsync({ id: warehouseId, data: payload });
      } else {
        await createMutation.mutateAsync({ data: payload });
      }
      await queryClient.invalidateQueries({ queryKey: getApiWarehouseQueryKey() });
      showSuccess({
        message: isEdit ? "Warehouse updated." : "Warehouse created.",
        duration: 1500,
        onDismiss: () => navigation.goBack(),
      });
    } catch (err) {
      handleApiError(err, { showError, setError });
    }
  };

  return (
    <ScreenShell
      title={isEdit ? "Edit warehouse" : "New warehouse"}
      subtitle="Warehouses anchor stock locations for equipment."
    >
      <Card style={{ backgroundColor: "#ffffff" }}>
        <Card.Content style={{ gap: 12 }}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Name"
                mode="outlined"
                value={value ?? ""}
                onChangeText={onChange}
                error={Boolean(errors.name)}
              />
            )}
          />
          {errors.name ? <Text style={{ color: "#b91c1c" }}>{errors.name.message}</Text> : null}
          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Location"
                mode="outlined"
                value={value ?? ""}
                onChangeText={onChange}
                error={Boolean(errors.location)}
              />
            )}
          />
          {errors.location ? (
            <Text style={{ color: "#b91c1c" }}>{errors.location.message}</Text>
          ) : null}
        </Card.Content>
      </Card>
      <Button
        mode="contained"
        loading={createMutation.isPending || updateMutation.isPending}
        onPress={handleSubmit(onSubmit)}
      >
        Save
      </Button>
    </ScreenShell>
  );
};
