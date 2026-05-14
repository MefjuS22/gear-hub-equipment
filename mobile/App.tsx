import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";

import { AppNavigator } from "./src/navigation/AppNavigator";
import { AppToastProvider } from "./src/providers/AppToastProvider";
import { appTheme } from "./src/theme";

const queryClient = new QueryClient();

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={appTheme}>
          <AppToastProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </AppToastProvider>
        </PaperProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
