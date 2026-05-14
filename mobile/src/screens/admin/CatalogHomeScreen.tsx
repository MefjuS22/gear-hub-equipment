import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";

import { ScreenShell } from "../../components/ScreenShell";
import type { CatalogStackParamList } from "../../navigation/navigationTypes";

type Props = NativeStackScreenProps<CatalogStackParamList, "CatalogHome">;

type RequiresParams<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends undefined ? never : K;
}[keyof T];

type CatalogHomeLinkTarget = Exclude<
  keyof CatalogStackParamList,
  RequiresParams<CatalogStackParamList>
>;

const rows: {
  title: string;
  subtitle: string;
  target: CatalogHomeLinkTarget;
}[] = [
  { title: "Brands", subtitle: "Create, edit, or remove equipment brands.", target: "BrandList" },
  { title: "Categories", subtitle: "Organize catalog items by category.", target: "CategoryList" },
  { title: "Warehouses", subtitle: "Storage locations for inventory.", target: "WarehouseList" },
  { title: "Equipment", subtitle: "Full equipment records with references.", target: "AdminEquipmentList" },
];

export const CatalogHomeScreen = ({ navigation }: Props) => {
  return (
    <ScreenShell title="Catalog administration" subtitle="Manage reference data and equipment records.">
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
