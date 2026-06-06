import { useCallback, useLayoutEffect } from "react";
import { Image, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Card, Chip, Divider, Text } from "react-native-paper";

import { resolvePublicFileUrl } from "../api/resolvePublicFileUrl";
import { generatedClientConfig } from "../api/generatedConfig";
import { useGetApiEquipmentId } from "../api/generated/react-query";
import { mapApiEquipment } from "../api/mappers";
import { EquipmentImagePlaceholder } from "../components/equipment-list/EquipmentImagePlaceholder";
import type { CatalogStackParamList, ShopStackParamList } from "../navigation/navigationTypes";
import { useAppToast } from "../providers/AppToastProvider";
import { useCartStore } from "../store/useCartStore";
import { getApiErrorDisplayMessage } from "../lib/apiError";
import { formatCurrency } from "../utils/formatCurrency";

type Props =
  | NativeStackScreenProps<ShopStackParamList, "EquipmentDetail">
  | NativeStackScreenProps<CatalogStackParamList, "EquipmentDetail">;

export const EquipmentDetailScreen = ({ navigation, route }: Props) => {
  const equipmentId = route.params.equipmentId;
  const { showInfo, showSuccess } = useAppToast();
  const addToCart = useCartStore((state) => state.addToCart);

  const detailQuery = useGetApiEquipmentId(equipmentId, {
    client: generatedClientConfig,
    query: { enabled: equipmentId > 0 },
  });

  const equipment = detailQuery.data;
  const mapped = equipment ? mapApiEquipment(equipment) : null;
  const heroUri = equipment?.imageUrl ? resolvePublicFileUrl(equipment.imageUrl) : "";

  useLayoutEffect(() => {
    navigation.setOptions({
      title: equipment?.name?.trim() ? equipment.name : "Equipment details",
    });
  }, [equipment?.name, navigation]);

  const onAddToCart = useCallback(() => {
    if (!mapped) {
      return;
    }
    if (!mapped.isAvailable) {
      showInfo({
        message:
          "This unit is unavailable. Choose dates on the catalog — availability is checked when you order.",
      });
      return;
    }
    addToCart(mapped);
    showSuccess({ message: `"${mapped.name}" added to your cart.`, duration: 1600 });
  }, [addToCart, mapped, showInfo, showSuccess]);

  if (detailQuery.isPending) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyLarge">Loading…</Text>
      </View>
    );
  }

  if (detailQuery.isError || !equipment || !mapped) {
    return (
      <View style={styles.centered}>
        <Text variant="titleMedium" style={styles.errorTitle}>
          Could not load equipment
        </Text>
        <Text variant="bodyMedium" style={styles.muted}>
          {getApiErrorDisplayMessage(detailQuery.error)}
        </Text>
        <Button mode="contained" style={styles.backBtn} onPress={() => navigation.goBack()}>
          Go back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={detailQuery.isRefetching}
          onRefresh={() => {
            void detailQuery.refetch();
          }}
        />
      }
    >
      <Card mode="elevated" style={styles.card}>
        <View style={styles.hero}>
          {heroUri ? (
            <Image source={{ uri: heroUri }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={styles.heroPlaceholder}>
              <EquipmentImagePlaceholder size={96} iconSize={40} />
            </View>
          )}
        </View>
        <Card.Content style={styles.cardBody}>
          <View style={styles.titleRow}>
            <Text variant="headlineSmall" style={styles.name}>
              {equipment.name}
            </Text>
            <Chip compact icon={mapped.isAvailable ? "check-decagram" : "alert-circle-outline"}>
              {mapped.isAvailable ? "Available" : "Unavailable"}
            </Chip>
          </View>
          <Text variant="bodyMedium" style={styles.unitId}>
            Unit #{equipment.id}
          </Text>
          <Text variant="headlineSmall" style={styles.rate}>
            ${formatCurrency(mapped.dailyRate)}
            <Text variant="bodyLarge" style={styles.rateSuffix}>
              {" "}
              / day
            </Text>
          </Text>

          <Divider style={styles.divider} />

          <Text variant="titleSmall" style={styles.sectionTitle}>
            Catalog
          </Text>
          <Text variant="bodyMedium" style={styles.row}>
            <Text style={styles.label}>Category: </Text>
            {equipment.categoryName ?? "—"} (ID {equipment.categoryId ?? "—"})
          </Text>
          <Text variant="bodyMedium" style={styles.row}>
            <Text style={styles.label}>Brand: </Text>
            {equipment.brandName ?? "—"} (ID {equipment.brandId ?? "—"})
          </Text>
          <Text variant="bodyMedium" style={styles.row}>
            <Text style={styles.label}>Warehouse: </Text>
            {equipment.warehouseName ?? "—"} (ID {equipment.warehouseId ?? "—"})
          </Text>

          <Button mode="contained" icon="cart-plus" style={styles.cta} onPress={onAddToCart}>
            Add to cart
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  hero: {
    width: "100%",
    backgroundColor: "#e5e7eb",
  },
  heroImage: {
    width: "100%",
    height: 220,
  },
  heroPlaceholder: {
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    gap: 8,
    paddingTop: 16,
  },
  titleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    justifyContent: "space-between",
  },
  name: {
    flex: 1,
    minWidth: 160,
    fontWeight: "700",
    color: "#001f3f",
  },
  unitId: {
    color: "#64748b",
  },
  rate: {
    fontWeight: "700",
    color: "#001f3f",
    marginTop: 4,
  },
  rateSuffix: {
    fontWeight: "500",
    color: "#475569",
  },
  divider: {
    marginVertical: 12,
  },
  sectionTitle: {
    color: "#334155",
    fontWeight: "600",
  },
  row: {
    color: "#1e293b",
  },
  label: {
    fontWeight: "600",
    color: "#475569",
  },
  cta: {
    marginTop: 16,
  },
  centered: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  errorTitle: {
    color: "#b91c1c",
    textAlign: "center",
  },
  muted: {
    color: "#64748b",
    textAlign: "center",
  },
  backBtn: {
    marginTop: 8,
  },
});
