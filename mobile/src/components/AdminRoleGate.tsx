import { PropsWithChildren } from "react";
import { StyleSheet } from "react-native";
import { Text } from "react-native-paper";

import { useAuth } from "../providers/AuthProvider";
import { userHasAdminRole } from "../lib/userRoles";
import { ScreenShell } from "./ScreenShell";

type AdminRoleGateProps = PropsWithChildren<{
  title?: string;
}>;

export const AdminRoleGate = ({
  title = "Staff access required",
  children,
}: AdminRoleGateProps) => {
  const { user, isLoadingProfile } = useAuth();
  const allowed = userHasAdminRole(user);

  if (isLoadingProfile) {
    return (
      <ScreenShell title={title} subtitle="Checking your account…">
        <Text variant="bodyMedium" style={styles.message}>
          Loading profile…
        </Text>
      </ScreenShell>
    );
  }

  if (!allowed) {
    return (
      <ScreenShell title={title} subtitle="The staff portal is limited to Admin accounts.">
        <Text variant="bodyMedium" style={styles.message}>
          Sign in with an Admin account to manage catalog data.
        </Text>
      </ScreenShell>
    );
  }

  return children;
};

const styles = StyleSheet.create({
  message: {
    color: "#64748b",
  },
});
