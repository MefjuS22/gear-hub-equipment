import { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

interface ScreenShellProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
  scrollable?: boolean;
}

export const ScreenShell = ({ title, subtitle, children, scrollable = true }: ScreenShellProps) => {
  const Content = scrollable ? ScrollView : View;

  return (
    <Content
      contentContainerStyle={styles.contentContainer}
      style={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text variant="headlineSmall" style={styles.title}>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="bodyMedium" style={styles.subtitle}>
          {subtitle}
        </Text>
      ) : null}
      {children}
    </Content>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  title: {
    color: "#001f3f",
    fontWeight: "700",
  },
  subtitle: {
    color: "#4a5560",
  },
});
