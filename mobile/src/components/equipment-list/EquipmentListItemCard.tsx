import { StyleSheet, View } from "react-native";
import { Button, Card, Chip, Text } from "react-native-paper";

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

  return (
    <Card style={styles.card}>
      <Card.Title title={item.name} subtitle={`Unit #${item.id}`} />
      <Card.Content style={styles.cardContent}>
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
