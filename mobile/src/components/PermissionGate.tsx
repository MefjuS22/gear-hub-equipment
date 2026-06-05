import { PropsWithChildren } from "react";
import { StyleSheet } from "react-native";
import { Text } from "react-native-paper";

import { useHasPermission } from "../hooks/usePermissionSet";
import { ScreenShell } from "./ScreenShell";

type PermissionGateProps = PropsWithChildren<{
  permission: string;
  title?: string;
}>;

export const PermissionGate = ({
  permission,
  title = "Access denied",
  children,
}: PermissionGateProps) => {
  const allowed = useHasPermission(permission);

  if (!allowed) {
    return (
      <ScreenShell title={title} subtitle="You do not have permission to view this section.">
        <Text variant="bodyMedium" style={styles.message}>
          Required permission: {permission}
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
