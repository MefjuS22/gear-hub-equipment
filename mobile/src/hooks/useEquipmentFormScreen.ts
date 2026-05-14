import { useCallback, useEffect, useMemo, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";

import { uploadFileNative } from "../api/uploadFileNative";
import { generatedClientConfig } from "../api/generatedConfig";
import { equipmentUpsertDtoSchema } from "../api/generated/zod";
import {
  getApiEquipmentQueryKey,
  useGetApiBrand,
  useGetApiCategory,
  useGetApiEquipmentId,
  useGetApiWarehouse,
  usePostApiEquipment,
  usePutApiEquipmentId,
} from "../api/generated/react-query";
import type {
  PostApiEquipmentMutationRequest,
  PutApiEquipmentIdMutationRequest,
} from "../api/generated/types";
import type { CatalogStackParamList } from "../navigation/navigationTypes";
import { useAppToast } from "../providers/AppToastProvider";

type Props = NativeStackScreenProps<CatalogStackParamList, "EquipmentForm">;

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

/**
 * Same fields as `postApiEquipmentMutationRequestSchema` from the generated API client; `dailyRate`
 * is edited as text in the UI and coerced on submit. `isAvailable` / `imageUrl` are narrowed for the form.
 */
const equipmentFormSchema = equipmentUpsertDtoSchema
  .omit({ dailyRate: true })
  .extend({
    dailyRate: z.string(),
    isAvailable: z.boolean(),
    imageUrl: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!String(data.name ?? "").trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Equipment name is required.",
        path: ["name"],
      });
    }
    if (data.categoryId == null || data.categoryId <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Category is required.",
        path: ["categoryId"],
      });
    }
    if (data.brandId == null || data.brandId <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Brand is required.",
        path: ["brandId"],
      });
    }
    if (data.warehouseId == null || data.warehouseId <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Warehouse is required.",
        path: ["warehouseId"],
      });
    }
    const rateRaw = String(data.dailyRate ?? "").trim();
    const rate = Number(rateRaw);
    if (!rateRaw || Number.isNaN(rate) || rate <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Daily rate must be a positive number.",
        path: ["dailyRate"],
      });
    }
  });

export type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;

export const useEquipmentFormScreen = ({ navigation, route }: Pick<Props, "navigation" | "route">) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useAppToast();
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [brandMenuVisible, setBrandMenuVisible] = useState(false);
  const [warehouseMenuVisible, setWarehouseMenuVisible] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const createMutation = usePostApiEquipment({
    client: generatedClientConfig,
  });
  const updateMutation = usePutApiEquipmentId({
    client: generatedClientConfig,
  });

  const equipmentId = route.params?.equipmentId;
  const isEditMode = Boolean(equipmentId);

  const equipmentDetailQuery = useGetApiEquipmentId(equipmentId ?? 0, {
    client: generatedClientConfig,
    query: { enabled: isEditMode },
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
  const warehousesQuery = useGetApiWarehouse({
    client: generatedClientConfig,
    query: {
      select: (rows) =>
        rows.map((w) => ({
          id: w.id ?? 0,
          name: w.name ?? "Unknown warehouse",
        })),
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      name: "",
      dailyRate: "0",
      categoryId: undefined,
      brandId: undefined,
      warehouseId: undefined,
      isAvailable: true,
      imageUrl: "",
    },
  });

  const categoryId = watch("categoryId");
  const brandId = watch("brandId");
  const warehouseId = watch("warehouseId");
  const imageUrl = watch("imageUrl");

  const categoryOptions = useMemo<SelectOption[]>(
    () => (categoriesQuery.data ?? []).filter((category) => category.id > 0),
    [categoriesQuery.data],
  );
  const brandOptions = useMemo<SelectOption[]>(
    () => (brandsQuery.data ?? []).filter((brand) => brand.id > 0),
    [brandsQuery.data],
  );
  const warehouseOptions = useMemo<SelectOption[]>(
    () => (warehousesQuery.data ?? []).filter((w) => w.id > 0),
    [warehousesQuery.data],
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

  useEffect(() => {
    if (!warehouseId && warehouseOptions.length > 0) {
      setValue("warehouseId", warehouseOptions[0].id);
    }
  }, [warehouseId, warehouseOptions, setValue]);

  useEffect(() => {
    const data = equipmentDetailQuery.data;
    if (!isEditMode || !data) {
      return;
    }
    reset({
      name: data.name ?? "",
      dailyRate: String(data.dailyRate ?? 0),
      categoryId: data.categoryId ?? undefined,
      brandId: data.brandId ?? undefined,
      warehouseId: data.warehouseId ?? undefined,
      isAvailable: data.isAvailable ?? true,
      imageUrl: data.imageUrl ?? "",
    });
  }, [equipmentDetailQuery.data, isEditMode, reset]);

  const selectedCategory = useMemo(
    () => categoryOptions.find((item) => item.id === Number(categoryId)),
    [categoryId, categoryOptions],
  );
  const selectedBrand = useMemo(
    () => brandOptions.find((item) => item.id === Number(brandId)),
    [brandId, brandOptions],
  );
  const selectedWarehouse = useMemo(
    () => warehouseOptions.find((item) => item.id === Number(warehouseId)),
    [warehouseId, warehouseOptions],
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onPickImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showError({ message: "Photo library permission is required to attach an image." });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    const name = asset.fileName ?? "upload.jpg";
    const type = asset.mimeType ?? "image/jpeg";

    setIsUploadingImage(true);
    try {
      const uploaded = await uploadFileNative(
        { uri: asset.uri, name, type },
        "equipment",
      );
      const path = uploaded.publicPath ?? uploaded.relativePath ?? "";
      if (!path) {
        showError({ message: "Upload succeeded but no file path was returned." });
        return;
      }
      setValue("imageUrl", path, { shouldDirty: true, shouldValidate: true });
      showSuccess({ message: "Image uploaded.", duration: 1400 });
    } catch {
      showError({ message: "Image upload failed. Check the API and try again." });
    } finally {
      setIsUploadingImage(false);
    }
  }, [setValue, showError, showSuccess]);

  const onClearImage = useCallback(() => {
    setValue("imageUrl", "", { shouldDirty: true });
  }, [setValue]);

  const onSubmit = async (values: EquipmentFormValues) => {
    const trimmedImage = typeof values.imageUrl === "string" ? values.imageUrl.trim() : "";
    const payload: PostApiEquipmentMutationRequest | PutApiEquipmentIdMutationRequest = {
      name: (values.name ?? "").trim(),
      dailyRate: Number(values.dailyRate),
      categoryId: values.categoryId,
      brandId: values.brandId,
      warehouseId: values.warehouseId,
      isAvailable: values.isAvailable,
      imageUrl: trimmedImage.length > 0 ? trimmedImage : null,
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
    warehouseMenuVisible,
    selectedCategory,
    selectedBrand,
    selectedWarehouse,
    categoryOptions,
    brandOptions,
    warehouseOptions,
    categoriesQuery,
    brandsQuery,
    warehousesQuery,
    isEditMode,
    isSubmitting,
    isUploadingImage,
    equipmentDetailQuery,
    imageUrl,
    onOpenCategoryMenu: () => setCategoryMenuVisible(true),
    onDismissCategoryMenu: () => setCategoryMenuVisible(false),
    onOpenBrandMenu: () => setBrandMenuVisible(true),
    onDismissBrandMenu: () => setBrandMenuVisible(false),
    onOpenWarehouseMenu: () => setWarehouseMenuVisible(true),
    onDismissWarehouseMenu: () => setWarehouseMenuVisible(false),
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
    onSelectWarehouse: (warehouseIdValue: number) => {
      setValue("warehouseId", warehouseIdValue, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setWarehouseMenuVisible(false);
    },
    onPickImage,
    onClearImage,
    onSubmitPress: handleSubmit(onSubmit),
  };
};
