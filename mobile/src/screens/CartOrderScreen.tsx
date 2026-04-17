import { StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button } from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";

import { CartItemsCard } from "../components/cart-order/CartItemsCard";
import { OrderDetailsCard } from "../components/cart-order/OrderDetailsCard";
import { ScreenShell } from "../components/ScreenShell";
import { useCartOrderScreen } from "../hooks/useCartOrderScreen";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "CartOrder">;

export const CartOrderScreen = ({ navigation, route }: Props) => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    customers,
    selectedCustomer,
    customersQuery,
    errors,
    subtotal,
    dateRange,
    dateRangeLabel,
    customerMenuVisible,
    isDateRangePickerVisible,
    createOrderMutation,
    onOpenCustomerMenu,
    onDismissCustomerMenu,
    onSelectCustomer,
    onOpenDateRangePicker,
    onDismissDateRangePicker,
    onConfirmDateRange,
    onConfirmOrderPress,
  } = useCartOrderScreen({ navigation, route });

  return (
    <ScreenShell title="Rental Cart" subtitle="Review items, assign customer, and submit an order.">
      <CartItemsCard
        items={items}
        onDecrease={(equipmentId) => updateQuantity(equipmentId, -1)}
        onIncrease={(equipmentId) => updateQuantity(equipmentId, 1)}
        onRemove={removeFromCart}
      />
      <OrderDetailsCard
        customers={customers}
        selectedCustomerName={selectedCustomer?.companyName}
        customerMenuVisible={customerMenuVisible}
        dateRangeLabel={dateRangeLabel}
        subtotal={subtotal}
        customerError={errors.customerId?.message}
        rentalStartDateError={errors.rentalStartDate?.message}
        rentalEndDateError={errors.rentalEndDate?.message}
        customersLoadError={Boolean(customersQuery.error)}
        onOpenCustomerMenu={onOpenCustomerMenu}
        onDismissCustomerMenu={onDismissCustomerMenu}
        onSelectCustomer={onSelectCustomer}
        onOpenDateRangePicker={onOpenDateRangePicker}
      />

      <Button
        mode="contained"
        icon="check-circle-outline"
        contentStyle={styles.confirmButtonContent}
        loading={createOrderMutation.isPending}
        disabled={createOrderMutation.isPending || items.length === 0 || customersQuery.isPending}
        onPress={onConfirmOrderPress}
      >
        Confirm Order
      </Button>

      <DatePickerModal
        locale="en-GB"
        mode="range"
        visible={isDateRangePickerVisible}
        onDismiss={onDismissDateRangePicker}
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        saveLabel="Apply"
        label="Select rental period"
        onConfirm={({ startDate, endDate }) => onConfirmDateRange(startDate, endDate)}
      />
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  confirmButtonContent: {
    minHeight: 48,
  },
});
