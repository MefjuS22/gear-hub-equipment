import { createDrawerNavigator } from "@react-navigation/drawer";
import { useTheme } from "react-native-paper";

import { CatalogNavigator } from "./CatalogNavigator";
import { NewsNavigator } from "./NewsNavigator";
import { OrdersNavigator } from "./OrdersNavigator";
import { ShopNavigator } from "./ShopNavigator";
import type { DrawerParamList } from "./navigationTypes";

const Drawer = createDrawerNavigator<DrawerParamList>();

export const RootDrawerNavigator = () => {
  const theme = useTheme();
  return (
    <Drawer.Navigator
      initialRouteName="Shop"
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
        component={CatalogNavigator}
        options={{ drawerLabel: "Catalog admin", title: "Catalog" }}
      />
      <Drawer.Screen name="News" component={NewsNavigator} options={{ drawerLabel: "News" }} />
      <Drawer.Screen name="Orders" component={OrdersNavigator} options={{ drawerLabel: "Orders" }} />
    </Drawer.Navigator>
  );
};
