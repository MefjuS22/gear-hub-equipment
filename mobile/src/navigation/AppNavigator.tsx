import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuthHydration } from "../hooks/useAuthHydration";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import { RootDrawerNavigator } from "./RootDrawerNavigator";
import type { RootStackParamList } from "./navigationTypes";

const Stack = createNativeStackNavigator<RootStackParamList>();

export { type CatalogStackParamList, type ShopStackParamList } from "./navigationTypes";

export const AppNavigator = () => {
  const hydrated = useAuthHydration();

  if (!hydrated) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color="#001f3f" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#001f3f" },
        headerTintColor: "#ffffff",
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: "#f8f9fa" },
      }}
    >
      <Stack.Screen name="Main" component={RootDrawerNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Sign in" }} />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: "Create account" }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
  },
});
