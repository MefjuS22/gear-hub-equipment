import { StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button } from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";

import { CartItemsCard } from "../components/cart-order/CartItemsCard";
import { OrderDetailsCard } from "../components/cart-order/OrderDetailsCard";
import { ScreenShell } from "../components/ScreenShell";
import { useCartOrderScreen } from "../hooks/useCartOrderScreen";
import type { ShopStackParamList } from "../navigation/navigationTypes";

type Props = NativeStackScreenProps<ShopStackParamList, "CartOrder">;

export const CartOrderScreen = ({ navigation, route }: Props) => {
  const {
    form,
    items,
    updateQuantity,
    removeFromCart,
    isAuthenticated,
    errors,
    subtotal,
    dateRange,
    dateRangeLabel,
    isDateRangePickerVisible,
    createOrderMutation,
    onOpenDateRangePicker,
    onDismissDateRangePicker,
    onConfirmDateRange,
    onConfirmOrderPress,
    onNavigateLogin,
    onNavigateRegister,
  } = useCartOrderScreen({ navigation, route });

  return (
    <ScreenShell
      title="Rental Cart"
      subtitle={
        isAuthenticated
          ? "Configure client details and rental parameters."
          : "Sign in to enter order details and confirm your rental."
      }
    >
      <CartItemsCard
        items={items}
        onDecrease={(equipmentId) => updateQuantity(equipmentId, -1)}
        onIncrease={(equipmentId) => updateQuantity(equipmentId, 1)}
        onRemove={removeFromCart}
      />
      <OrderDetailsCard
        form={form}
        dateRangeLabel={dateRangeLabel}
        subtotal={subtotal}
        isAuthenticated={isAuthenticated}
        companyNameError={errors.companyName?.message}
        contactPersonError={errors.contactPerson?.message}
        rentalStartDateError={errors.rentalStartDate?.message}
        rentalEndDateError={errors.rentalEndDate?.message}
        onOpenDateRangePicker={onOpenDateRangePicker}
        onNavigateLogin={onNavigateLogin}
        onNavigateRegister={onNavigateRegister}
      />

      {isAuthenticated ? (
        <Button
          mode="contained"
          icon="check-circle-outline"
          contentStyle={styles.confirmButtonContent}
          loading={createOrderMutation.isPending}
          disabled={createOrderMutation.isPending || items.length === 0}
          onPress={onConfirmOrderPress}
        >
          Confirm Order
        </Button>
      ) : null}

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
