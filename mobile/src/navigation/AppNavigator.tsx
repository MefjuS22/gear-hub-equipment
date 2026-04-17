import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { CartOrderScreen } from "../screens/CartOrderScreen";
import { EquipmentFormScreen } from "../screens/EquipmentFormScreen";
import { EquipmentListScreen } from "../screens/EquipmentListScreen";
import { OrderConfirmationScreen } from "../screens/OrderConfirmationScreen";

export type RootStackParamList = {
  EquipmentList: undefined;
  EquipmentForm: { equipmentId?: number } | undefined;
  CartOrder: undefined;
  OrderConfirmation: {
    customerName: string;
    rentalStartDate: string;
    rentalEndDate: string;
    itemsCount: number;
    subtotalPerDay: number;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="EquipmentList"
      screenOptions={{
        headerStyle: { backgroundColor: "#001f3f" },
        headerTintColor: "#ffffff",
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: "#f8f9fa" },
      }}
    >
      <Stack.Screen
        name="EquipmentList"
        component={EquipmentListScreen}
        options={{ title: "GearHub Equipment" }}
      />
      <Stack.Screen
        name="EquipmentForm"
        component={EquipmentFormScreen}
        options={{ title: "Equipment Form" }}
      />
      <Stack.Screen
        name="CartOrder"
        component={CartOrderScreen}
        options={{ title: "Create Rental Order" }}
      />
      <Stack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
        options={{
          title: "Order Confirmation",
          headerBackVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};
