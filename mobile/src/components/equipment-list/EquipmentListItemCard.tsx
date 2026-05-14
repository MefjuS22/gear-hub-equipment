import { Image, StyleSheet, View } from "react-native";
import { Button, Card, Chip, Text } from "react-native-paper";

import { resolvePublicFileUrl } from "../../api/resolvePublicFileUrl";
import { EquipmentImagePlaceholder } from "./EquipmentImagePlaceholder";
import { QuantityControl } from "../QuantityControl";
import { Equipment } from "../../types";

type Props = {
  item: Equipment;
  quantityInCart: number;
  onAddToCart: (equipmentId: number) => void;
  onUpdateQuantity: (equipmentId: number, delta: number) => void;
};

export const EquipmentListItemCard = ({
  item,
  quantityInCart,
  onAddToCart,
  onUpdateQuantity,
}: Props) => {
  const inCart = quantityInCart > 0;
  const thumbUri = item.imageUrl ? resolvePublicFileUrl(item.imageUrl) : "";

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.topRow}>
          {thumbUri ? (
            <Image source={{ uri: thumbUri }} style={styles.thumb} resizeMode="cover" />
          ) : (
            <EquipmentImagePlaceholder size={88} iconSize={36} />
          )}
          <View style={styles.titleBlock}>
            <Text variant="titleMedium" style={styles.title}>
              {item.name}
            </Text>
            <Text variant="bodySmall" style={styles.subtitle}>
              Unit #{item.id}
            </Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Chip compact>Category #{item.categoryId}</Chip>
          <Chip compact>Brand #{item.brandId}</Chip>
          <Chip compact>{item.dailyRate.toFixed(2)} / day</Chip>
        </View>
        {inCart ? (
          <View style={styles.cartRow}>
            <Chip compact icon="cart-check" style={styles.inCartChip}>
              In cart
            </Chip>
            <QuantityControl
              quantity={quantityInCart}
              onDecrease={() => {
                onUpdateQuantity(item.id, -1);
              }}
              onIncrease={() => {
                onUpdateQuantity(item.id, 1);
              }}
            />
          </View>
        ) : (
          <Button
            mode={item.isAvailable ? "contained" : "outlined"}
            icon="cart-plus"
            onPress={() => onAddToCart(item.id)}
          >
            {item.isAvailable ? "Add to Cart" : "Unavailable"}
          </Button>
        )}
        {!item.isAvailable ? (
          <Text variant="bodySmall" style={styles.unavailableHint}>
            Reserved right now. You can choose a rental period above and try again.
          </Text>
        ) : null}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  unavailableHint: {
    color: "#6b7280",
  },
  card: {
    backgroundColor: "#ffffff",
  },
  cardContent: {
    gap: 12,
  },
  topRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  thumb: {
    width: 88,
    height: 88,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontWeight: "700",
    color: "#001f3f",
  },
  subtitle: {
    color: "#64748b",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cartRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  inCartChip: {
    alignSelf: "center",
  },
});
