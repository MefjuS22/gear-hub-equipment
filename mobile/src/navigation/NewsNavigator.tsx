import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { NewsDetailScreen } from "../screens/news/NewsDetailScreen";
import { NewsListScreen } from "../screens/news/NewsListScreen";
import type { NewsStackParamList } from "./navigationTypes";
import { sharedStackScreenOptions } from "./StackLayout.tsx";

const Stack = createNativeStackNavigator<NewsStackParamList>();

export const NewsNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="NewsList"
      screenOptions={sharedStackScreenOptions}
    >
      <Stack.Screen name="NewsList" component={NewsListScreen} options={{ title: "News" }} />
      <Stack.Screen name="NewsDetail" component={NewsDetailScreen} options={{ title: "Article" }} />
    </Stack.Navigator>
  );
};
