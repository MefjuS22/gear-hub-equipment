import { StyleSheet, View } from "react-native";
import { Button, Card, Divider, Text } from "react-native-paper";

import { QuantityControl } from "../QuantityControl";
import { CartItem } from "../../types";

type Props = {
  items: CartItem[];
  onDecrease: (equipmentId: number) => void;
  onIncrease: (equipmentId: number) => void;
  onRemove: (equipmentId: number) => void;
};

export const CartItemsCard = ({ items, onDecrease, onIncrease, onRemove }: Props) => {
  return (
    <Card style={styles.sectionCard}>
      <Card.Title title="Cart Items" />
      <Card.Content style={styles.cardContent}>
        {items.length === 0 ? (
          <Text variant="bodyMedium">No equipment selected yet. Add items from Equipment Fleet.</Text>
        ) : (
          items.map((item, index) => (
            <View key={item.equipmentId}>
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text variant="titleMedium">{item.name}</Text>
                  <Text variant="bodySmall">${item.dailyRate.toFixed(2)} / day</Text>
                </View>

                <QuantityControl
                  quantity={item.quantity}
                  onDecrease={() => onDecrease(item.equipmentId)}
                  onIncrease={() => onIncrease(item.equipmentId)}
                />
              </View>
              <Button
                compact
                icon="delete-outline"
                mode="text"
                onPress={() => onRemove(item.equipmentId)}
              >
                Remove
              </Button>
              {index < items.length - 1 ? <Divider /> : null}
            </View>
          ))
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: "#ffffff",
  },
  cardContent: {
    gap: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
});
