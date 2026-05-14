import { DrawerActions, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { IconButton } from "react-native-paper";

import { NewsDetailScreen } from "../screens/news/NewsDetailScreen";
import { NewsListScreen } from "../screens/news/NewsListScreen";
import type { NewsStackParamList } from "./navigationTypes";

const Stack = createNativeStackNavigator<NewsStackParamList>();

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

export const NewsNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="NewsList"
      screenOptions={{
        headerStyle: { backgroundColor: "#001f3f" },
        headerTintColor: "#ffffff",
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: "#f8f9fa" },
        headerRight: () => <DrawerMenuButton />,
      }}
    >
      <Stack.Screen name="NewsList" component={NewsListScreen} options={{ title: "News" }} />
      <Stack.Screen name="NewsDetail" component={NewsDetailScreen} options={{ title: "Article" }} />
    </Stack.Navigator>
  );
};
