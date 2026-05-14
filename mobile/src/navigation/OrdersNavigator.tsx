import { DrawerActions, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { IconButton } from "react-native-paper";

import { OrderDetailScreen } from "../screens/orders/OrderDetailScreen";
import { OrderListScreen } from "../screens/orders/OrderListScreen";
import type { OrdersStackParamList } from "./navigationTypes";

const Stack = createNativeStackNavigator<OrdersStackParamList>();

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

export const OrdersNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#001f3f" },
        headerTintColor: "#ffffff",
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: "#f8f9fa" },
        headerRight: () => <DrawerMenuButton />,
      }}
    >
      <Stack.Screen name="OrderList" component={OrderListScreen} options={{ title: "Rental orders" }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: "Order" }} />
    </Stack.Navigator>
  );
};
