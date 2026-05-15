import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { CartOrderScreen } from "../screens/CartOrderScreen";
import { EquipmentDetailScreen } from "../screens/EquipmentDetailScreen";
import { EquipmentListScreen } from "../screens/EquipmentListScreen";
import { OrderConfirmationScreen } from "../screens/OrderConfirmationScreen";
import type { ShopStackParamList } from "./navigationTypes";
import { sharedStackScreenOptions } from "./StackLayout.tsx";

const Stack = createNativeStackNavigator<ShopStackParamList>();

export const ShopNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="EquipmentList"
      screenOptions={sharedStackScreenOptions}
    >
      <Stack.Screen
        name="EquipmentList"
        component={EquipmentListScreen}
        options={{ title: "Browse equipment" }}
      />
      <Stack.Screen
        name="EquipmentDetail"
        component={EquipmentDetailScreen}
        options={{ title: "Equipment" }}
      />
      <Stack.Screen
        name="CartOrder"
        component={CartOrderScreen}
        options={{ title: "Create rental order" }}
      />
      <Stack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
        options={{
          title: "Order confirmation",
          headerBackVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};
