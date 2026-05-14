import { DrawerActions, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { IconButton } from "react-native-paper";

import { AdminEquipmentListScreen } from "../screens/admin/AdminEquipmentListScreen";
import { BrandFormScreen } from "../screens/admin/BrandFormScreen";
import { BrandListScreen } from "../screens/admin/BrandListScreen";
import { CatalogHomeScreen } from "../screens/admin/CatalogHomeScreen";
import { CategoryFormScreen } from "../screens/admin/CategoryFormScreen";
import { CategoryListScreen } from "../screens/admin/CategoryListScreen";
import { WarehouseFormScreen } from "../screens/admin/WarehouseFormScreen";
import { WarehouseListScreen } from "../screens/admin/WarehouseListScreen";
import { EquipmentFormScreen } from "../screens/EquipmentFormScreen";
import type { CatalogStackParamList } from "./navigationTypes";

const Stack = createNativeStackNavigator<CatalogStackParamList>();

const DrawerMenuButton = () => {
  const navigation = useNavigation();
  return (
    <IconButton
      icon="menu"
      iconColor="#ffffff"
      onPress={() => {
        navigation.dispatch(DrawerActions.openDrawer());
      }}
    />
  );
};

export const CatalogNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="CatalogHome"
      screenOptions={{
        headerStyle: { backgroundColor: "#001f3f" },
        headerTintColor: "#ffffff",
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: "#f8f9fa" },
        headerRight: () => <DrawerMenuButton />,
      }}
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
      <Stack.Screen name="EquipmentForm" component={EquipmentFormScreen} options={{ title: "Equipment" }} />
    </Stack.Navigator>
  );
};
