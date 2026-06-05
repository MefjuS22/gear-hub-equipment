import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";

import { setupGearHubApiClient } from "./src/api/setupGearHubApiClient";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { AppToastProvider } from "./src/providers/AppToastProvider";
import { AuthProvider } from "./src/providers/AuthProvider";
import { appTheme } from "./src/theme";

setupGearHubApiClient();

const queryClient = new QueryClient();

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PaperProvider theme={appTheme}>
            <AppToastProvider>
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
            </AppToastProvider>
          </PaperProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
