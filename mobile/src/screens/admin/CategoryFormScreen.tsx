import { useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Text, TextInput } from "react-native-paper";

import { generatedClientConfig } from "../../api/generatedConfig";
import { postApiCategoryMutationRequestSchema } from "../../api/generated/zod";
import {
  getApiCategoryQueryKey,
  useGetApiCategoryId,
  usePostApiCategory,
  usePutApiCategoryId,
} from "../../api/generated/react-query";
import type {
  PostApiCategoryMutationRequest,
  PutApiCategoryIdMutationRequest,
} from "../../api/generated/types";
import { ScreenShell } from "../../components/ScreenShell";
import type { CatalogStackParamList } from "../../navigation/navigationTypes";
import { useAppToast } from "../../providers/AppToastProvider";

type Props = NativeStackScreenProps<CatalogStackParamList, "CategoryForm">;

const categoryFormSchema = postApiCategoryMutationRequestSchema.superRefine((data, ctx) => {
  if (!String(data.name ?? "").trim()) {
    ctx.addIssue({
      code: "custom",
      message: "Name is required.",
      path: ["name"],
    });
  }
});

type FormValues = PostApiCategoryMutationRequest;

export const CategoryFormScreen = ({ navigation, route }: Props) => {
  const categoryId = route.params?.categoryId;
  const isEdit = categoryId != null;
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useAppToast();

  const detailQuery = useGetApiCategoryId(categoryId ?? 0, {
    client: generatedClientConfig,
    query: { enabled: isEdit },
  });

  const createMutation = usePostApiCategory({ client: generatedClientConfig });
  const updateMutation = usePutApiCategoryId({ client: generatedClientConfig });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    if (detailQuery.data) {
      reset({
        name: detailQuery.data.name ?? "",
        description: detailQuery.data.description ?? "",
      });
    }
  }, [detailQuery.data, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload: PostApiCategoryMutationRequest | PutApiCategoryIdMutationRequest = {
      name: (values.name ?? "").trim(),
      description: values.description?.trim() || null,
    };
    try {
      if (isEdit && categoryId != null) {
        await updateMutation.mutateAsync({ id: categoryId, data: payload });
      } else {
        await createMutation.mutateAsync({ data: payload });
      }
      await queryClient.invalidateQueries({ queryKey: getApiCategoryQueryKey() });
      showSuccess({
        message: isEdit ? "Category updated." : "Category created.",
        duration: 1500,
        onDismiss: () => navigation.goBack(),
      });
    } catch {
      showError({ message: "Save failed. Check the API." });
    }
  };

  return (
    <ScreenShell
      title={isEdit ? "Edit category" : "New category"}
      subtitle="Categories group equipment for browsing and reporting."
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
            name="description"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Description"
                mode="outlined"
                multiline
                numberOfLines={3}
                value={value ?? ""}
                onChangeText={onChange}
              />
            )}
          />
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
