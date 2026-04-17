import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

type Props = {
  cartItemsCount: number;
  selectedRangeLabel: string;
  onOpenDateRangePicker: () => void;
  onOpenCart: () => void;
};

export const EquipmentListHeader = ({
  cartItemsCount,
  selectedRangeLabel,
  onOpenDateRangePicker,
  onOpenCart,
}: Props) => {
  return (
    <View style={styles.header}>
      <Text variant="headlineSmall" style={styles.title}>
        Equipment Fleet
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Add available units to the rental cart.
      </Text>
      <Button icon="calendar-range" mode="outlined" onPress={onOpenDateRangePicker}>
        Rental Period: {selectedRangeLabel}
      </Button>
      <Button icon="cart-outline" mode="contained-tonal" onPress={onOpenCart}>
        Open Cart ({cartItemsCount})
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    gap: 8,
    marginBottom: 4,
  },
  title: {
    color: "#001f3f",
    fontWeight: "700",
  },
  subtitle: {
    color: "#4b5563",
  },
});
