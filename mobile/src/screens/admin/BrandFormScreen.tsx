import { useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Text, TextInput } from "react-native-paper";

import { generatedClientConfig } from "../../api/generatedConfig";
import { postApiBrandMutationRequestSchema } from "../../api/generated/zod";
import {
  getApiBrandQueryKey,
  useGetApiBrandId,
  usePostApiBrand,
  usePutApiBrandId,
} from "../../api/generated/react-query";
import type { PostApiBrandMutationRequest, PutApiBrandIdMutationRequest } from "../../api/generated/types";
import { ScreenShell } from "../../components/ScreenShell";
import type { CatalogStackParamList } from "../../navigation/navigationTypes";
import { useAppToast } from "../../providers/AppToastProvider";

type Props = NativeStackScreenProps<CatalogStackParamList, "BrandForm">;

/** Generated API body schema + refinements for mobile form UX. */
const brandFormSchema = postApiBrandMutationRequestSchema.superRefine((data, ctx) => {
  if (!String(data.name ?? "").trim()) {
    ctx.addIssue({
      code: "custom",
      message: "Name is required.",
      path: ["name"],
    });
  }
});

type FormValues = PostApiBrandMutationRequest;

export const BrandFormScreen = ({ navigation, route }: Props) => {
  const brandId = route.params?.brandId;
  const isEdit = brandId != null;
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useAppToast();

  const detailQuery = useGetApiBrandId(brandId ?? 0, {
    client: generatedClientConfig,
    query: { enabled: isEdit },
  });

  const createMutation = usePostApiBrand({ client: generatedClientConfig });
  const updateMutation = usePutApiBrandId({ client: generatedClientConfig });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (detailQuery.data) {
      reset({ name: detailQuery.data.name ?? "" });
    }
  }, [detailQuery.data, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload: PostApiBrandMutationRequest | PutApiBrandIdMutationRequest = {
      name: (values.name ?? "").trim(),
    };
    try {
      if (isEdit && brandId != null) {
        await updateMutation.mutateAsync({ id: brandId, data: payload });
      } else {
        await createMutation.mutateAsync({ data: payload });
      }
      await queryClient.invalidateQueries({ queryKey: getApiBrandQueryKey() });
      showSuccess({
        message: isEdit ? "Brand updated." : "Brand created.",
        duration: 1500,
        onDismiss: () => navigation.goBack(),
      });
    } catch {
      showError({ message: "Save failed. Check the API." });
    }
  };

  return (
    <ScreenShell title={isEdit ? "Edit brand" : "New brand"} subtitle="Brand names must stay unique in the catalog.">
      <Card style={{ backgroundColor: "#ffffff" }}>
        <Card.Content style={{ gap: 12 }}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <TextInput label="Name" mode="outlined" value={value ?? ""} onChangeText={onChange} error={Boolean(errors.name)} />
            )}
          />
          {errors.name ? <Text style={{ color: "#b91c1c" }}>{errors.name.message}</Text> : null}
        </Card.Content>
      </Card>
      <Button mode="contained" loading={createMutation.isPending || updateMutation.isPending} onPress={handleSubmit(onSubmit)}>
        Save
      </Button>
    </ScreenShell>
  );
};
