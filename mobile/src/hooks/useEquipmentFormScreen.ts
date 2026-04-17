import { useEffect, useMemo, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAppToast } from "../providers/AppToastProvider";

type Props = NativeStackScreenProps<RootStackParamList, "EquipmentForm">;

export type SelectOption = {
  id: number;
  name: string;
};

export const asRequiredMessage = (message: string | undefined, fieldLabel: string) => {
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

export type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;

export const useEquipmentFormScreen = ({ navigation, route }: Pick<Props, "navigation" | "route">) => {
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

  return {
    control,
    errors,
    categoryMenuVisible,
    brandMenuVisible,
    selectedCategory,
    selectedBrand,
    categoryOptions,
    brandOptions,
    categoriesQuery,
    brandsQuery,
    isEditMode,
    isSubmitting,
    onOpenCategoryMenu: () => setCategoryMenuVisible(true),
    onDismissCategoryMenu: () => setCategoryMenuVisible(false),
    onOpenBrandMenu: () => setBrandMenuVisible(true),
    onDismissBrandMenu: () => setBrandMenuVisible(false),
    onSelectCategory: (categoryIdValue: number) => {
      setValue("categoryId", categoryIdValue, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setCategoryMenuVisible(false);
    },
    onSelectBrand: (brandIdValue: number) => {
      setValue("brandId", brandIdValue, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setBrandMenuVisible(false);
    },
    onSubmitPress: handleSubmit(onSubmit),
  };
};
