import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";

import { ScreenShell } from "../../components/ScreenShell";
import { usePermissionSet } from "../../hooks/usePermissionSet";
import { CATALOG_NAV } from "../../lib/catalogNav";
import type { CatalogStackParamList } from "../../navigation/navigationTypes";

type Props = NativeStackScreenProps<CatalogStackParamList, "CatalogHome">;

export const CatalogHomeScreen = ({ navigation }: Props) => {
  const permissions = usePermissionSet();
  const rows = CATALOG_NAV.filter((row) => permissions.has(row.permission));

  return (
    <ScreenShell
      title="Catalog administration"
      subtitle="Manage reference data and equipment records."
    >
      {rows.length === 0 ? (
        <Text variant="bodyMedium" style={styles.hint}>
          No catalog sections are available for your account permissions.
        </Text>
      ) : (
        <View style={styles.grid}>
          {rows.map((row) => (
            <Card key={row.target} style={styles.card} mode="elevated">
              <Card.Title title={row.title} subtitle={row.subtitle} titleNumberOfLines={2} />
              <Card.Actions>
                <Button mode="contained" onPress={() => navigation.navigate(row.target)}>
                  Open
                </Button>
              </Card.Actions>
            </Card>
          ))}
        </View>
      )}
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  grid: {
    gap: 12,
  },
  card: {
    backgroundColor: "#ffffff",
  },
  hint: {
    color: "#64748b",
    marginTop: 8,
  },
});
