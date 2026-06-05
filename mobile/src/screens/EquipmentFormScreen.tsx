import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { Button, Text } from "react-native-paper";

import { EquipmentFormCard } from "../components/equipment-form/EquipmentFormCard";
import { useEquipmentFormScreen } from "../hooks/useEquipmentFormScreen";
import { ScreenShell } from "../components/ScreenShell";
import type { CatalogStackParamList } from "../navigation/navigationTypes";

type Props = NativeStackScreenProps<CatalogStackParamList, "EquipmentForm">;

export const EquipmentFormScreen = ({ navigation, route }: Props) => {
  const {
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
    onOpenCategoryMenu,
    onDismissCategoryMenu,
    onOpenBrandMenu,
    onDismissBrandMenu,
    onOpenWarehouseMenu,
    onDismissWarehouseMenu,
    onSelectCategory,
    onSelectBrand,
    onSelectWarehouse,
    onPickImage,
    onClearImage,
    onSubmitPress,
  } = useEquipmentFormScreen({ navigation, route });

  const detailLoading = isEditMode && equipmentDetailQuery.isPending;
  const detailError = isEditMode && equipmentDetailQuery.isError;

  return (
    <ScreenShell
      title={isEditMode ? "Update equipment" : "Create equipment"}
      subtitle="Assign category, brand, and warehouse, then set pricing and availability."
    >
      {detailLoading ? (
        <View style={{ paddingVertical: 24, alignItems: "center" }}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 12 }}>Loading equipment…</Text>
        </View>
      ) : null}
      {detailError ? (
        <Text style={{ color: "#b91c1c", marginBottom: 8 }}>
          Could not load this equipment record.
        </Text>
      ) : null}

      {!detailLoading && !detailError ? (
        <>
          <EquipmentFormCard
            control={control}
            errors={errors}
            categoryMenuVisible={categoryMenuVisible}
            brandMenuVisible={brandMenuVisible}
            warehouseMenuVisible={warehouseMenuVisible}
            selectedCategory={selectedCategory}
            selectedBrand={selectedBrand}
            selectedWarehouse={selectedWarehouse}
            categoryOptions={categoryOptions}
            brandOptions={brandOptions}
            warehouseOptions={warehouseOptions}
            categoriesLoadError={Boolean(categoriesQuery.error)}
            brandsLoadError={Boolean(brandsQuery.error)}
            warehousesLoadError={Boolean(warehousesQuery.error)}
            imageUrl={typeof imageUrl === "string" ? imageUrl : ""}
            isUploadingImage={isUploadingImage}
            onOpenCategoryMenu={onOpenCategoryMenu}
            onDismissCategoryMenu={onDismissCategoryMenu}
            onOpenBrandMenu={onOpenBrandMenu}
            onDismissBrandMenu={onDismissBrandMenu}
            onOpenWarehouseMenu={onOpenWarehouseMenu}
            onDismissWarehouseMenu={onDismissWarehouseMenu}
            onSelectCategory={onSelectCategory}
            onSelectBrand={onSelectBrand}
            onSelectWarehouse={onSelectWarehouse}
            onPickImage={onPickImage}
            onClearImage={onClearImage}
          />

          <Button
            mode="contained"
            icon="content-save-outline"
            loading={isSubmitting}
            disabled={isSubmitting || detailLoading}
            onPress={onSubmitPress}
          >
            {isEditMode ? "Update equipment" : "Create equipment"}
          </Button>
        </>
      ) : null}
    </ScreenShell>
  );
};
