import { useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { generatedClientConfig } from "../api/generatedConfig";
import { useGetApiEquipment } from "../api/generated/react-query";
import { mapApiEquipment } from "../api/mappers";
import type { ShopStackParamList } from "../navigation/navigationTypes";
import { useAppToast } from "../providers/AppToastProvider";
import { useCartStore } from "../store/useCartStore";
import { formatDateForApi, formatDateForDisplay, parseDateInput } from "../utils/date";

type Props = NativeStackScreenProps<ShopStackParamList, "EquipmentList">;

export const useEquipmentListScreen = ({ navigation }: Pick<Props, "navigation">) => {
  const { showInfo } = useAppToast();
  const addToCart = useCartStore((state) => state.addToCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const cartItems = useCartStore((state) => state.items);
  const cartItemsCount = cartItems.length;
  const [isDateRangePickerVisible, setIsDateRangePickerVisible] = useState(false);
  const [rentalStartDate, setRentalStartDate] = useState("2026-04-17");
  const [rentalEndDate, setRentalEndDate] = useState("2026-04-20");
  const [dateRange, setDateRange] = useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
  }>({
    startDate: parseDateInput("2026-04-17"),
    endDate: parseDateInput("2026-04-20"),
  });

  const equipmentQuery = useGetApiEquipment({
    client: generatedClientConfig,
    query: {
      select: (data) => data.map(mapApiEquipment),
    },
  });

  const equipment = equipmentQuery.data ?? [];
  const selectedRangeLabel = `${formatDateForDisplay(rentalStartDate)} - ${formatDateForDisplay(
    rentalEndDate,
  )}`;

  const onOpenDateRangePicker = () => {
    setIsDateRangePickerVisible(true);
  };

  const onDismissDateRangePicker = () => {
    setIsDateRangePickerVisible(false);
  };

  const onConfirmDateRange = (startDate?: Date, endDate?: Date) => {
    setIsDateRangePickerVisible(false);
    setDateRange({ startDate, endDate });

    if (startDate) {
      setRentalStartDate(formatDateForApi(startDate));
    }

    if (endDate) {
      setRentalEndDate(formatDateForApi(endDate));
    }
  };

  const onOpenCart = () => {
    navigation.navigate("CartOrder", {
      initialRentalStartDate: rentalStartDate,
      initialRentalEndDate: rentalEndDate,
    });
  };

  const onAddToCart = (equipmentId: number) => {
    const item = equipment.find((equipmentItem) => equipmentItem.id === equipmentId);
    if (!item) {
      return;
    }

    if (!item.isAvailable) {
      showInfo({
        message:
          "This unit is currently unavailable. Pick your rental period and we will re-check availability during order confirmation.",
      });
      return;
    }

    addToCart(item);
  };

  return {
    cartItems,
    cartItemsCount,
    updateQuantity,
    equipment,
    equipmentQuery,
    dateRange,
    selectedRangeLabel,
    isDateRangePickerVisible,
    onOpenDateRangePicker,
    onDismissDateRangePicker,
    onConfirmDateRange,
    onAddToCart,
    onOpenCart,
    refreshing: equipmentQuery.isRefetching,
    loading: equipmentQuery.isPending,
  };
};
