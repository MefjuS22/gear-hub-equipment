import { Controller, Control, FieldErrors } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { Button, Card, Menu, Switch, Text, TextInput } from "react-native-paper";

import {
  asRequiredMessage,
  EquipmentFormValues,
  SelectOption,
} from "../../hooks/useEquipmentFormScreen";

type Props = {
  control: Control<EquipmentFormValues>;
  errors: FieldErrors<EquipmentFormValues>;
  categoryMenuVisible: boolean;
  brandMenuVisible: boolean;
  selectedCategory?: SelectOption;
  selectedBrand?: SelectOption;
  categoryOptions: SelectOption[];
  brandOptions: SelectOption[];
  categoriesLoadError: boolean;
  brandsLoadError: boolean;
  onOpenCategoryMenu: () => void;
  onDismissCategoryMenu: () => void;
  onOpenBrandMenu: () => void;
  onDismissBrandMenu: () => void;
  onSelectCategory: (categoryId: number) => void;
  onSelectBrand: (brandId: number) => void;
};

export const EquipmentFormCard = ({
  control,
  errors,
  categoryMenuVisible,
  brandMenuVisible,
  selectedCategory,
  selectedBrand,
  categoryOptions,
  brandOptions,
  categoriesLoadError,
  brandsLoadError,
  onOpenCategoryMenu,
  onDismissCategoryMenu,
  onOpenBrandMenu,
  onDismissBrandMenu,
  onSelectCategory,
  onSelectBrand,
}: Props) => {
  return (
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
            onDismiss={onDismissCategoryMenu}
            anchor={
              <Button
                mode="outlined"
                icon="chevron-down"
                style={[styles.selectButton, errors.categoryId ? styles.selectButtonError : null]}
                labelStyle={styles.selectButtonLabel}
                contentStyle={styles.menuButtonContent}
                onPress={onOpenCategoryMenu}
              >
                {selectedCategory?.name ?? "Select category"}
              </Button>
            }
          >
            {categoryOptions.map((category) => (
              <Menu.Item
                key={category.id}
                title={category.name}
                onPress={() => onSelectCategory(category.id)}
              />
            ))}
          </Menu>
          {errors.categoryId ? (
            <Text style={styles.errorText}>
              {asRequiredMessage(errors.categoryId.message, "Category")}
            </Text>
          ) : null}
          {categoriesLoadError ? (
            <Text style={styles.errorText}>Failed to load categories from backend.</Text>
          ) : null}
        </View>

        <View>
          <Text variant="labelLarge" style={styles.fieldLabel}>
            Brand
          </Text>
          <Menu
            visible={brandMenuVisible}
            onDismiss={onDismissBrandMenu}
            anchor={
              <Button
                mode="outlined"
                icon="chevron-down"
                style={[styles.selectButton, errors.brandId ? styles.selectButtonError : null]}
                labelStyle={styles.selectButtonLabel}
                contentStyle={styles.menuButtonContent}
                onPress={onOpenBrandMenu}
              >
                {selectedBrand?.name ?? "Select brand"}
              </Button>
            }
          >
            {brandOptions.map((brand) => (
              <Menu.Item key={brand.id} title={brand.name} onPress={() => onSelectBrand(brand.id)} />
            ))}
          </Menu>
          {errors.brandId ? (
            <Text style={styles.errorText}>{asRequiredMessage(errors.brandId.message, "Brand")}</Text>
          ) : null}
          {brandsLoadError ? (
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
