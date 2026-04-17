import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Menu, Switch, Text, TextInput } from "react-native-paper";
import { z } from "zod/v4";

import { generatedClientConfig } from "../api/generatedConfig";
import { equipmentUpsertDtoSchema } from "../api/generated/zod";
import {
  getApiEquipmentQueryKey,
  useGetApiBrand,
  useGetApiCategory,
  usePostApiEquipment,
  usePutApiEquipmentId,
} from "../api/generated/react-query";
import type {
  PostApiEquipmentMutationRequest,
  PutApiEquipmentIdMutationRequest,
} from "../api/generated/types";
import { ScreenShell } from "../components/ScreenShell";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAppToast } from "../providers/AppToastProvider";

type Props = NativeStackScreenProps<RootStackParamList, "EquipmentForm">;

type SelectOption = {
  id: number;
  name: string;
};

const asRequiredMessage = (message: string | undefined, fieldLabel: string) => {
  if (!message) {
    return `${fieldLabel} is required.`;
  }

  if (message.toLowerCase().includes("invalid input")) {
    return `${fieldLabel} is required.`;
  }

  return message;
};

const requiredSelectNumber = (fieldLabel: string) =>
  z
    .number()
    .int()
    .refine((value) => typeof value === "number" && value > 0, {
      message: `${fieldLabel} is required.`,
    });

const equipmentFormSchema = equipmentUpsertDtoSchema
  .pick({
    name: true,
    categoryId: true,
    brandId: true,
    warehouseId: true,
    dailyRate: true,
    isAvailable: true,
  })
  .extend({
    name: z.string().trim().min(1, "Equipment name is required."),
    categoryId: requiredSelectNumber("Category"),
    brandId: requiredSelectNumber("Brand"),
    warehouseId: z.number().int().positive(),
    dailyRate: z
      .string()
      .trim()
      .min(1, "Daily rate is required.")
      .refine((value) => !Number.isNaN(Number(value)) && Number(value) > 0, {
        message: "Daily rate must be a positive number.",
      }),
    isAvailable: z.boolean(),
  });

type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;

export const EquipmentFormScreen = ({ navigation, route }: Props) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useAppToast();
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [brandMenuVisible, setBrandMenuVisible] = useState(false);
  const createMutation = usePostApiEquipment({
    client: generatedClientConfig,
  });
  const updateMutation = usePutApiEquipmentId({
    client: generatedClientConfig,
  });
  const categoriesQuery = useGetApiCategory({
    client: generatedClientConfig,
    query: {
      select: (categories) =>
        categories.map((category) => ({
          id: category.id ?? 0,
          name: category.name ?? "Unknown category",
        })),
    },
  });
  const brandsQuery = useGetApiBrand({
    client: generatedClientConfig,
    query: {
      select: (brands) =>
        brands.map((brand) => ({
          id: brand.id ?? 0,
          name: brand.name ?? "Unknown brand",
        })),
    },
  });
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      name: "",
      dailyRate: "0",
      categoryId: undefined,
      brandId: undefined,
      warehouseId: 1,
      isAvailable: true,
    },
  });

  const categoryId = watch("categoryId");
  const brandId = watch("brandId");
  const categoryOptions = useMemo<SelectOption[]>(
    () => (categoriesQuery.data ?? []).filter((category) => category.id > 0),
    [categoriesQuery.data],
  );
  const brandOptions = useMemo<SelectOption[]>(
    () => (brandsQuery.data ?? []).filter((brand) => brand.id > 0),
    [brandsQuery.data],
  );

  useEffect(() => {
    if (!categoryId && categoryOptions.length > 0) {
      setValue("categoryId", categoryOptions[0].id);
    }
  }, [categoryId, categoryOptions, setValue]);

  useEffect(() => {
    if (!brandId && brandOptions.length > 0) {
      setValue("brandId", brandOptions[0].id);
    }
  }, [brandId, brandOptions, setValue]);

  const selectedCategory = useMemo(
    () => categoryOptions.find((item) => item.id === Number(categoryId)),
    [categoryId, categoryOptions],
  );
  const selectedBrand = useMemo(
    () => brandOptions.find((item) => item.id === Number(brandId)),
    [brandId, brandOptions],
  );

  const equipmentId = route.params?.equipmentId;
  const isEditMode = Boolean(equipmentId);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: EquipmentFormValues) => {
    const payload: PostApiEquipmentMutationRequest | PutApiEquipmentIdMutationRequest = {
      name: values.name.trim(),
      dailyRate: Number(values.dailyRate),
      categoryId: values.categoryId,
      brandId: values.brandId,
      warehouseId: values.warehouseId,
      isAvailable: values.isAvailable,
    };

    try {
      if (isEditMode && equipmentId) {
        await updateMutation.mutateAsync({
          id: equipmentId,
          data: payload,
        });
      } else {
        await createMutation.mutateAsync({ data: payload });
      }

      await queryClient.invalidateQueries({
        queryKey: getApiEquipmentQueryKey(),
      });

      showSuccess({
        message: `${isEditMode ? "Updated" : "Created"} equipment "${values.name}" successfully.`,
        duration: 1800,
        onDismiss: () => {
          navigation.goBack();
        },
      });
    } catch {
      showError({
        message: "Unable to save equipment. Check backend availability.",
      });
    }
  };

  return (
    <ScreenShell
      title={isEditMode ? "Update Equipment" : "Create Equipment"}
      subtitle="Use this form to maintain your rental inventory catalog."
    >
      <Card style={styles.formCard}>
        <Card.Content style={styles.formContent}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Equipment Name"
                value={value}
                mode="outlined"
                onChangeText={onChange}
                error={Boolean(errors.name)}
              />
            )}
          />
          {errors.name ? <Text style={styles.errorText}>{errors.name.message}</Text> : null}

          <Controller
            control={control}
            name="dailyRate"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Daily Rate"
                value={value}
                mode="outlined"
                keyboardType="decimal-pad"
                left={<TextInput.Affix text="$" />}
                onChangeText={onChange}
                error={Boolean(errors.dailyRate)}
              />
            )}
          />
          {errors.dailyRate ? <Text style={styles.errorText}>{errors.dailyRate.message}</Text> : null}

          <View>
            <Text variant="labelLarge" style={styles.fieldLabel}>
              Category
            </Text>
            <Menu
              visible={categoryMenuVisible}
              onDismiss={() => setCategoryMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  icon="chevron-down"
                  style={[styles.selectButton, errors.categoryId ? styles.selectButtonError : null]}
                  labelStyle={styles.selectButtonLabel}
                  contentStyle={styles.menuButtonContent}
                  onPress={() => setCategoryMenuVisible(true)}
                >
                  {selectedCategory?.name ?? "Select category"}
                </Button>
              }
            >
              {categoryOptions.map((category) => (
                <Menu.Item
                  key={category.id}
                  title={category.name}
                  onPress={() => {
                    setValue("categoryId", category.id, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    setCategoryMenuVisible(false);
                  }}
                />
              ))}
            </Menu>
            {errors.categoryId ? (
              <Text style={styles.errorText}>
                {asRequiredMessage(errors.categoryId.message, "Category")}
              </Text>
            ) : null}
            {categoriesQuery.error ? (
              <Text style={styles.errorText}>Failed to load categories from backend.</Text>
            ) : null}
          </View>

          <View>
            <Text variant="labelLarge" style={styles.fieldLabel}>
              Brand
            </Text>
            <Menu
              visible={brandMenuVisible}
              onDismiss={() => setBrandMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  icon="chevron-down"
                  style={[styles.selectButton, errors.brandId ? styles.selectButtonError : null]}
                  labelStyle={styles.selectButtonLabel}
                  contentStyle={styles.menuButtonContent}
                  onPress={() => setBrandMenuVisible(true)}
                >
                  {selectedBrand?.name ?? "Select brand"}
                </Button>
              }
            >
              {brandOptions.map((brand) => (
                <Menu.Item
                  key={brand.id}
                  title={brand.name}
                  onPress={() => {
                    setValue("brandId", brand.id, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    setBrandMenuVisible(false);
                  }}
                />
              ))}
            </Menu>
            {errors.brandId ? (
              <Text style={styles.errorText}>
                {asRequiredMessage(errors.brandId.message, "Brand")}
              </Text>
            ) : null}
            {brandsQuery.error ? (
              <Text style={styles.errorText}>Failed to load brands from backend.</Text>
            ) : null}
          </View>

          <Controller
            control={control}
            name="isAvailable"
            render={({ field: { onChange, value } }) => (
              <View style={styles.switchRow}>
                <Text variant="titleMedium">Available for rental</Text>
                <Switch value={value} onValueChange={onChange} />
              </View>
            )}
          />
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        icon="content-save-outline"
        loading={isSubmitting}
        disabled={isSubmitting}
        onPress={handleSubmit(onSubmit)}
      >
        {isEditMode ? "Update Equipment" : "Create Equipment"}
      </Button>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: "#ffffff",
  },
  formContent: {
    gap: 14,
  },
  fieldLabel: {
    marginBottom: 6,
    color: "#334155",
  },
  errorText: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: "#b91c1c",
  },
  selectButton: {
    borderColor: "#cbd5e1",
  },
  selectButtonError: {
    borderColor: "#b91c1c",
  },
  selectButtonLabel: {
    textAlign: "left",
  },
  menuButtonContent: {
    justifyContent: "space-between",
    flexDirection: "row-reverse",
  },
  switchRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
