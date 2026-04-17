import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Card, FAB, Text } from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";

import { EquipmentListHeader } from "../components/equipment-list/EquipmentListHeader";
import { EquipmentListItemCard } from "../components/equipment-list/EquipmentListItemCard";
import { useEquipmentListScreen } from "../hooks/useEquipmentListScreen";
import { RootStackParamList } from "../navigation/AppNavigator";
type Props = NativeStackScreenProps<RootStackParamList, "EquipmentList">;

export const EquipmentListScreen = ({ navigation }: Props) => {
  const {
    cartItems,
    cartItemsCount,
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
    onCreateEquipment,
    refreshing,
    loading,
    updateQuantity,
  } = useEquipmentListScreen({ navigation });

  return (
    <View style={styles.container}>
      <FlatList
        data={equipment}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <EquipmentListHeader
            cartItemsCount={cartItemsCount}
            selectedRangeLabel={selectedRangeLabel}
            onOpenDateRangePicker={onOpenDateRangePicker}
            onOpenCart={onOpenCart}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void equipmentQuery.refetch();
            }}
          />
        }
        ListEmptyComponent={
          loading ? (
            <Card style={styles.emptyCard}>
              <Card.Title title="Loading equipment..." />
            </Card>
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Title title={equipmentQuery.error ? "Failed to load equipment" : "No equipment found"} />
              <Card.Content>
                <Text variant="bodyMedium">
                  {equipmentQuery.error
                    ? "Unable to fetch data from backend. Check if Docker services are running."
                    : "No equipment available in the database."}
                </Text>
              </Card.Content>
            </Card>
          )
        }
        renderItem={({ item }) => {
          const quantityInCart =
            cartItems.find((entry) => entry.equipmentId === item.id)?.quantity ?? 0;
          return (
            <EquipmentListItemCard
              item={item}
              quantityInCart={quantityInCart}
              onAddToCart={onAddToCart}
              onUpdateQuantity={(equipmentId: number, delta: number) => {
                updateQuantity(equipmentId, delta);
              }}
            />
          );
        }}
      />

      <FAB icon="plus" label="New Equipment" style={styles.fab} onPress={onCreateEquipment} />

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  listContent: {
    padding: 16,
    paddingBottom: 88,
    gap: 12,
  },
  emptyCard: {
    backgroundColor: "#ffffff",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 20,
  },
});
