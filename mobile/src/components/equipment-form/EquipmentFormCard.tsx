import { Controller, Control, FieldErrors } from "react-hook-form";
import { Image, StyleSheet, View } from "react-native";
import { Button, Card, Menu, Switch, Text, TextInput } from "react-native-paper";

import { resolvePublicFileUrl } from "../../api/resolvePublicFileUrl";
import { EquipmentImagePlaceholder } from "../equipment-list/EquipmentImagePlaceholder";
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
  warehouseMenuVisible: boolean;
  selectedCategory?: SelectOption;
  selectedBrand?: SelectOption;
  selectedWarehouse?: SelectOption;
  categoryOptions: SelectOption[];
  brandOptions: SelectOption[];
  warehouseOptions: SelectOption[];
  categoriesLoadError: boolean;
  brandsLoadError: boolean;
  warehousesLoadError: boolean;
  imageUrl: string;
  isUploadingImage: boolean;
  onOpenCategoryMenu: () => void;
  onDismissCategoryMenu: () => void;
  onOpenBrandMenu: () => void;
  onDismissBrandMenu: () => void;
  onOpenWarehouseMenu: () => void;
  onDismissWarehouseMenu: () => void;
  onSelectCategory: (categoryId: number) => void;
  onSelectBrand: (brandId: number) => void;
  onSelectWarehouse: (warehouseId: number) => void;
  onPickImage: () => void;
  onClearImage: () => void;
};

export const EquipmentFormCard = ({
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
  categoriesLoadError,
  brandsLoadError,
  warehousesLoadError,
  imageUrl,
  isUploadingImage,
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
}: Props) => {
  const previewUri = imageUrl ? resolvePublicFileUrl(imageUrl) : "";

  return (
    <Card style={styles.formCard}>
      <Card.Content style={styles.formContent}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Equipment Name"
              value={value ?? ""}
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

        <View>
          <Text variant="labelLarge" style={styles.fieldLabel}>
            Warehouse
          </Text>
          <Menu
            visible={warehouseMenuVisible}
            onDismiss={onDismissWarehouseMenu}
            anchor={
              <Button
                mode="outlined"
                icon="chevron-down"
                style={[styles.selectButton, errors.warehouseId ? styles.selectButtonError : null]}
                labelStyle={styles.selectButtonLabel}
                contentStyle={styles.menuButtonContent}
                onPress={onOpenWarehouseMenu}
              >
                {selectedWarehouse?.name ?? "Select warehouse"}
              </Button>
            }
          >
            {warehouseOptions.map((w) => (
              <Menu.Item key={w.id} title={w.name} onPress={() => onSelectWarehouse(w.id)} />
            ))}
          </Menu>
          {errors.warehouseId ? (
            <Text style={styles.errorText}>
              {asRequiredMessage(errors.warehouseId.message, "Warehouse")}
            </Text>
          ) : null}
          {warehousesLoadError ? (
            <Text style={styles.errorText}>Failed to load warehouses from backend.</Text>
          ) : null}
        </View>

        <View>
          <Text variant="labelLarge" style={styles.fieldLabel}>
            Catalog image
          </Text>
          {previewUri ? (
            <Image source={{ uri: previewUri }} style={styles.preview} resizeMode="cover" />
          ) : (
            <View style={styles.previewEmpty}>
              <EquipmentImagePlaceholder size={72} iconSize={28} />
            </View>
          )}
          <View style={styles.imageActions}>
            <Button
              mode="outlined"
              icon="image-plus"
              onPress={onPickImage}
              loading={isUploadingImage}
              disabled={isUploadingImage}
            >
              Choose photo
            </Button>
            <Button mode="text" onPress={onClearImage} disabled={!imageUrl}>
              Clear
            </Button>
          </View>
          <Controller
            control={control}
            name="imageUrl"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Image path (from upload)"
                value={value ?? ""}
                mode="outlined"
                onChangeText={onChange}
                placeholder="/files/equipment/…"
              />
            )}
          />
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
  preview: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
    marginBottom: 8,
  },
  previewEmpty: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  imageActions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 8,
  },
});
