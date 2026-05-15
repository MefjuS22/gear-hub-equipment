import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AdminEquipmentListScreen } from "../screens/admin/AdminEquipmentListScreen";
import { BrandFormScreen } from "../screens/admin/BrandFormScreen";
import { BrandListScreen } from "../screens/admin/BrandListScreen";
import { CatalogHomeScreen } from "../screens/admin/CatalogHomeScreen";
import { CategoryFormScreen } from "../screens/admin/CategoryFormScreen";
import { CategoryListScreen } from "../screens/admin/CategoryListScreen";
import { WarehouseFormScreen } from "../screens/admin/WarehouseFormScreen";
import { WarehouseListScreen } from "../screens/admin/WarehouseListScreen";
import { EquipmentDetailScreen } from "../screens/EquipmentDetailScreen";
import { EquipmentFormScreen } from "../screens/EquipmentFormScreen";
import type { CatalogStackParamList } from "./navigationTypes";
import { sharedStackScreenOptions } from "./StackLayout.tsx";

const Stack = createNativeStackNavigator<CatalogStackParamList>();

export const CatalogNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="CatalogHome"
      screenOptions={sharedStackScreenOptions}
    >
      <Stack.Screen name="CatalogHome" component={CatalogHomeScreen} options={{ title: "Catalog" }} />
      <Stack.Screen name="BrandList" component={BrandListScreen} options={{ title: "Brands" }} />
      <Stack.Screen name="BrandForm" component={BrandFormScreen} options={{ title: "Brand" }} />
      <Stack.Screen name="CategoryList" component={CategoryListScreen} options={{ title: "Categories" }} />
      <Stack.Screen name="CategoryForm" component={CategoryFormScreen} options={{ title: "Category" }} />
      <Stack.Screen name="WarehouseList" component={WarehouseListScreen} options={{ title: "Warehouses" }} />
      <Stack.Screen name="WarehouseForm" component={WarehouseFormScreen} options={{ title: "Warehouse" }} />
      <Stack.Screen
        name="AdminEquipmentList"
        component={AdminEquipmentListScreen}
        options={{ title: "Equipment (admin)" }}
      />
      <Stack.Screen
        name="EquipmentDetail"
        component={EquipmentDetailScreen}
        options={{ title: "Equipment" }}
      />
      <Stack.Screen name="EquipmentForm" component={EquipmentFormScreen} options={{ title: "Equipment" }} />
    </Stack.Navigator>
  );
};
