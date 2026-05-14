import { DrawerActions, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { IconButton } from "react-native-paper";

import { CartOrderScreen } from "../screens/CartOrderScreen";
import { EquipmentDetailScreen } from "../screens/EquipmentDetailScreen";
import { EquipmentListScreen } from "../screens/EquipmentListScreen";
import { OrderConfirmationScreen } from "../screens/OrderConfirmationScreen";
import type { ShopStackParamList } from "./navigationTypes";

const Stack = createNativeStackNavigator<ShopStackParamList>();

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

export const ShopNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="EquipmentList"
      screenOptions={{
        headerStyle: { backgroundColor: "#001f3f" },
        headerTintColor: "#ffffff",
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: "#f8f9fa" },
        headerRight: () => <DrawerMenuButton />,
      }}
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
