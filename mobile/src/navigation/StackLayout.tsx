import { DrawerActions, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { IconButton } from "react-native-paper";

export const DrawerMenuButton = () => {
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

export const sharedStackScreenOptions = {
  headerStyle: { backgroundColor: "#001f3f" },
  headerTintColor: "#ffffff",
  headerTitleStyle: { fontWeight: "700" as const },
  contentStyle: { backgroundColor: "#f8f9fa" },
  headerRight: () => <DrawerMenuButton />,
} satisfies NativeStackNavigationOptions;
