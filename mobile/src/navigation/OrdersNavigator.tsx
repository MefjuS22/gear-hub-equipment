import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { OrderDetailScreen } from "../screens/orders/OrderDetailScreen";
import { OrderListScreen } from "../screens/orders/OrderListScreen";
import type { OrdersStackParamList } from "./navigationTypes";
import { sharedStackScreenOptions } from "./StackLayout.tsx";

const Stack = createNativeStackNavigator<OrdersStackParamList>();

export const OrdersNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={sharedStackScreenOptions}
    >
      <Stack.Screen name="OrderList" component={OrderListScreen} options={{ title: "Rental orders" }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: "Order" }} />
    </Stack.Navigator>
  );
};
