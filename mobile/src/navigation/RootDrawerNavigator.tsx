import { createDrawerNavigator } from "@react-navigation/drawer";
import { useTheme } from "react-native-paper";

import { AdminRoleGate } from "../components/AdminRoleGate";
import { PermissionGate } from "../components/PermissionGate";
import { AppPermissions } from "../lib/appPermissions";
import { AppDrawerContent } from "./AppDrawerContent";
import { CatalogNavigator } from "./CatalogNavigator";
import { NewsNavigator } from "./NewsNavigator";
import { OrdersNavigator } from "./OrdersNavigator";
import { ShopNavigator } from "./ShopNavigator";
import type { DrawerParamList } from "./navigationTypes";

const Drawer = createDrawerNavigator<DrawerParamList>();

const GatedCatalogNavigator = () => (
  <AdminRoleGate>
    <CatalogNavigator />
  </AdminRoleGate>
);

const GatedOrdersNavigator = () => (
  <AdminRoleGate>
    <PermissionGate permission={AppPermissions.OrdersRead}>
      <OrdersNavigator />
    </PermissionGate>
  </AdminRoleGate>
);

export const RootDrawerNavigator = () => {
  const theme = useTheme();
  return (
    <Drawer.Navigator
      initialRouteName="Shop"
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: "#64748b",
        drawerStyle: { backgroundColor: "#ffffff" },
      }}
    >
      <Drawer.Screen
        name="Shop"
        component={ShopNavigator}
        options={{ drawerLabel: "Browse & rent", title: "Shop" }}
      />
      <Drawer.Screen
        name="Catalog"
        component={GatedCatalogNavigator}
        options={{ drawerLabel: "Catalog admin", title: "Catalog" }}
      />
      <Drawer.Screen name="News" component={NewsNavigator} options={{ drawerLabel: "News" }} />
      <Drawer.Screen
        name="Orders"
        component={GatedOrdersNavigator}
        options={{ drawerLabel: "Orders", title: "Orders" }}
      />
    </Drawer.Navigator>
  );
};
