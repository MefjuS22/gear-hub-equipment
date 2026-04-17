import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, View } from "react-native";
import { Avatar, Button, Card, Divider, Text } from "react-native-paper";

import { ScreenShell } from "../components/ScreenShell";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "OrderConfirmation">;

const formatDateForDisplay = (value: string) => {
  const parsedDate = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

export const OrderConfirmationScreen = ({ navigation, route }: Props) => {
  const { customerName, rentalStartDate, rentalEndDate, itemsCount, subtotalPerDay } = route.params;

  return (
    <ScreenShell
      title="Order Confirmed"
      subtitle="Your rental order has been created successfully."
      scrollable={false}
    >
      <Card style={styles.confirmationCard}>
        <Card.Content style={styles.confirmationContent}>
          <Avatar.Icon
            size={58}
            icon="check-circle-outline"
            color="#ffffff"
            style={styles.successIcon}
          />
          <Text variant="titleLarge" style={styles.successTitle}>
            Booking complete
          </Text>
          <Text variant="bodyMedium" style={styles.successSubtitle}>
            The equipment reservation is now in your system.
          </Text>

          <Divider />

          <View style={styles.detailRow}>
            <Text variant="labelLarge">Customer</Text>
            <Text variant="bodyLarge">{customerName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="labelLarge">Rental period</Text>
            <Text variant="bodyLarge">
              {formatDateForDisplay(rentalStartDate)} - {formatDateForDisplay(rentalEndDate)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="labelLarge">Items</Text>
            <Text variant="bodyLarge">{itemsCount}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="labelLarge">Subtotal / day</Text>
            <Text variant="bodyLarge">${subtotalPerDay.toFixed(2)}</Text>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        icon="warehouse"
        onPress={() => navigation.reset({ index: 0, routes: [{ name: "EquipmentList" }] })}
      >
        Back to Equipment Fleet
      </Button>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  confirmationCard: {
    backgroundColor: "#ffffff",
  },
  confirmationContent: {
    gap: 12,
    alignItems: "center",
  },
  successIcon: {
    backgroundColor: "#0f766e",
  },
  successTitle: {
    color: "#0b2545",
    fontWeight: "700",
  },
  successSubtitle: {
    color: "#475569",
    textAlign: "center",
  },
  detailRow: {
    width: "100%",
    gap: 2,
  },
});
