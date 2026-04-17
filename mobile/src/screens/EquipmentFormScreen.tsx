import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button } from "react-native-paper";

import { EquipmentFormCard } from "../components/equipment-form/EquipmentFormCard";
import { useEquipmentFormScreen } from "../hooks/useEquipmentFormScreen";
import { ScreenShell } from "../components/ScreenShell";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "EquipmentForm">;

export const EquipmentFormScreen = ({ navigation, route }: Props) => {
  const {
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
    onOpenCategoryMenu,
    onDismissCategoryMenu,
    onOpenBrandMenu,
    onDismissBrandMenu,
    onSelectCategory,
    onSelectBrand,
    onSubmitPress,
  } = useEquipmentFormScreen({ navigation, route });

  return (
    <ScreenShell
      title={isEditMode ? "Update Equipment" : "Create Equipment"}
      subtitle="Use this form to maintain your rental inventory catalog."
    >
      <EquipmentFormCard
        control={control}
        errors={errors}
        categoryMenuVisible={categoryMenuVisible}
        brandMenuVisible={brandMenuVisible}
        selectedCategory={selectedCategory}
        selectedBrand={selectedBrand}
        categoryOptions={categoryOptions}
        brandOptions={brandOptions}
        categoriesLoadError={Boolean(categoriesQuery.error)}
        brandsLoadError={Boolean(brandsQuery.error)}
        onOpenCategoryMenu={onOpenCategoryMenu}
        onDismissCategoryMenu={onDismissCategoryMenu}
        onOpenBrandMenu={onOpenBrandMenu}
        onDismissBrandMenu={onDismissBrandMenu}
        onSelectCategory={onSelectCategory}
        onSelectBrand={onSelectBrand}
      />

      <Button
        mode="contained"
        icon="content-save-outline"
        loading={isSubmitting}
        disabled={isSubmitting}
        onPress={onSubmitPress}
      >
        {isEditMode ? "Update Equipment" : "Create Equipment"}
      </Button>
    </ScreenShell>
  );
};
