import { StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";

interface QuantityControlProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
}

export const QuantityControl = ({ quantity, onDecrease, onIncrease }: QuantityControlProps) => {
  return (
    <View style={styles.container}>
      <IconButton
        icon="minus-circle-outline"
        size={20}
        mode="contained-tonal"
        onPress={onDecrease}
      />
      <Text variant="titleMedium" style={styles.quantity}>
        {quantity}
      </Text>
      <IconButton
        icon="plus-circle-outline"
        size={20}
        mode="contained-tonal"
        onPress={onIncrease}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  quantity: {
    minWidth: 28,
    textAlign: "center",
  },
});
