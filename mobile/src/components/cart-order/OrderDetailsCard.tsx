import { StyleSheet, View } from "react-native";
import { Button, Card, Menu, Text } from "react-native-paper";

import { Customer } from "../../types";

type Props = {
  customers: Customer[];
  selectedCustomerName?: string;
  customerMenuVisible: boolean;
  dateRangeLabel: string;
  subtotal: number;
  customerError?: string;
  rentalStartDateError?: string;
  rentalEndDateError?: string;
  customersLoadError: boolean;
  onOpenCustomerMenu: () => void;
  onDismissCustomerMenu: () => void;
  onSelectCustomer: (customerId: number) => void;
  onOpenDateRangePicker: () => void;
};

export const OrderDetailsCard = ({
  customers,
  selectedCustomerName,
  customerMenuVisible,
  dateRangeLabel,
  subtotal,
  customerError,
  rentalStartDateError,
  rentalEndDateError,
  customersLoadError,
  onOpenCustomerMenu,
  onDismissCustomerMenu,
  onSelectCustomer,
  onOpenDateRangePicker,
}: Props) => {
  return (
    <Card style={styles.sectionCard}>
      <Card.Title title="Order Details" />
      <Card.Content style={styles.cardContent}>
        <View>
          <Text variant="labelLarge" style={styles.fieldLabel}>
            Customer
          </Text>
          <Menu
            visible={customerMenuVisible}
            onDismiss={onDismissCustomerMenu}
            anchor={
              <Button
                mode="outlined"
                icon="chevron-down"
                contentStyle={styles.menuButtonContent}
                onPress={onOpenCustomerMenu}
              >
                {selectedCustomerName ?? "Select customer"}
              </Button>
            }
          >
            {customers.map((customer) => (
              <Menu.Item
                key={customer.id}
                title={customer.companyName}
                onPress={() => onSelectCustomer(customer.id)}
              />
            ))}
          </Menu>
          {customerError ? <Text style={styles.errorText}>{customerError}</Text> : null}
          {customersLoadError ? (
            <Text variant="bodySmall" style={styles.errorText}>
              Failed to load customers from backend.
            </Text>
          ) : null}
        </View>

        <View>
          <Text variant="labelLarge" style={styles.fieldLabel}>
            Rental Period
          </Text>
          <Button
            mode="outlined"
            icon="calendar-range"
            contentStyle={styles.menuButtonContent}
            style={[styles.dateRangeButton, rentalStartDateError || rentalEndDateError ? styles.dateRangeButtonError : null]}
            onPress={onOpenDateRangePicker}
          >
            {dateRangeLabel}
          </Button>
        </View>
        {rentalStartDateError ? <Text style={styles.errorText}>{rentalStartDateError}</Text> : null}
        {rentalEndDateError ? <Text style={styles.errorText}>{rentalEndDateError}</Text> : null}
        <Text variant="titleMedium">Subtotal / day: ${subtotal.toFixed(2)}</Text>
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
  fieldLabel: {
    marginBottom: 6,
    color: "#334155",
  },
  errorText: {
    marginTop: 2,
    color: "#b91c1c",
  },
  dateRangeButton: {
    borderColor: "#cbd5e1",
  },
  dateRangeButtonError: {
    borderColor: "#b91c1c",
  },
  menuButtonContent: {
    justifyContent: "space-between",
    flexDirection: "row-reverse",
  },
});
