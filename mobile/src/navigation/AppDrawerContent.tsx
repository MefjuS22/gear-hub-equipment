import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { CommonActions } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";
import { Divider, Text } from "react-native-paper";

import { usePermissionSet } from "../hooks/usePermissionSet";
import { AppPermissions } from "../lib/appPermissions";
import { userHasAdminRole } from "../lib/userRoles";
import { useAuth } from "../providers/AuthProvider";

export const AppDrawerContent = (props: DrawerContentComponentProps) => {
  const { isAuthenticated, user, logout, isLoadingProfile } = useAuth();
  const permissions = usePermissionSet();
  const showCatalog = isAuthenticated && userHasAdminRole(user);
  const showOrders =
    isAuthenticated && userHasAdminRole(user) && permissions.has(AppPermissions.OrdersRead);

  const filteredRoutes = props.state.routes.filter((route) => {
    if (route.name === "Catalog") {
      return showCatalog;
    }
    if (route.name === "Orders") {
      return showOrders;
    }
    return true;
  });

  const filteredState = {
    ...props.state,
    routes: filteredRoutes,
    index: Math.min(props.state.index, Math.max(filteredRoutes.length - 1, 0)),
  };

  const displayName = user?.displayName ?? user?.email ?? "Signed-in user";

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.brand}>
          GearHub
        </Text>
        {isAuthenticated ? (
          <Text variant="bodySmall" style={styles.account}>
            {isLoadingProfile ? "Loading profile…" : displayName}
          </Text>
        ) : (
          <Text variant="bodySmall" style={styles.account}>
            Browse as guest
          </Text>
        )}
      </View>

      <DrawerItemList {...props} state={filteredState} />

      <Divider style={styles.divider} />

      {isAuthenticated ? (
        <DrawerItem
          label="Sign out"
          onPress={() => {
            logout();
            props.navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "Main" }],
              }),
            );
          }}
          labelStyle={styles.signOutLabel}
        />
      ) : (
        <>
          <DrawerItem
            label="Sign in"
            onPress={() => {
              props.navigation.dispatch(CommonActions.navigate({ name: "Login" }));
            }}
          />
          <DrawerItem
            label="Create account"
            onPress={() => {
              props.navigation.dispatch(CommonActions.navigate({ name: "Register" }));
            }}
          />
        </>
      )}
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 4,
  },
  brand: {
    color: "#001f3f",
    fontWeight: "700",
  },
  account: {
    color: "#64748b",
  },
  divider: {
    marginVertical: 8,
  },
  signOutLabel: {
    color: "#b42318",
  },
});
