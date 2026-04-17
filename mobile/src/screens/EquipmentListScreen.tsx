import { useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Card, Chip, FAB, Text } from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";

import { generatedClientConfig } from "../api/generatedConfig";
import { useGetApiEquipment } from "../api/generated/react-query";
import { mapApiEquipment } from "../api/mappers";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAppToast } from "../providers/AppToastProvider";
import { useCartStore } from "../store/useCartStore";

type Props = NativeStackScreenProps<RootStackParamList, "EquipmentList">;

const parseDateInput = (value: string) => {
  const parsedDate = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
};

const formatDateForApi = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateForDisplay = (value: string) => {
  const parsedDate = parseDateInput(value);
  if (!parsedDate) {
    return value;
  }

  return parsedDate.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

export const EquipmentListScreen = ({ navigation }: Props) => {
  const { showInfo } = useAppToast();
  const addToCart = useCartStore((state) => state.addToCart);
  const cartItemsCount = useCartStore((state) => state.items.length);
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
  const loading = equipmentQuery.isPending;
  const refreshing = equipmentQuery.isRefetching;
  const selectedRangeLabel = `${formatDateForDisplay(rentalStartDate)} - ${formatDateForDisplay(
    rentalEndDate,
  )}`;

  const addItemToCart = (isAvailable: boolean, onAdd: () => void) => {
    if (!isAvailable) {
      showInfo({
        message:
          "This unit is currently unavailable. Pick your rental period and we will re-check availability during order confirmation.",
      });
      return;
    }

    onAdd();
  };

  const listHeader = useMemo(
    () => (
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Equipment Fleet
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Add available units to the rental cart.
        </Text>
        <Button
          icon="calendar-range"
          mode="outlined"
          onPress={() => setIsDateRangePickerVisible(true)}
        >
          Rental Period: {selectedRangeLabel}
        </Button>
        <Button
          icon="cart-outline"
          mode="contained-tonal"
          onPress={() =>
            navigation.navigate("CartOrder", {
              initialRentalStartDate: rentalStartDate,
              initialRentalEndDate: rentalEndDate,
            })
          }
        >
          Open Cart ({cartItemsCount})
        </Button>
      </View>
    ),
    [cartItemsCount, navigation, rentalEndDate, rentalStartDate, selectedRangeLabel],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={equipment}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={listHeader}
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
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Title title={item.name} subtitle={`Unit #${item.id}`} />
            <Card.Content style={styles.cardContent}>
              <View style={styles.metaRow}>
                <Chip compact>Category #{item.categoryId}</Chip>
                <Chip compact>Brand #{item.brandId}</Chip>
                <Chip compact>{item.dailyRate.toFixed(2)} / day</Chip>
              </View>
              <Button
                mode={item.isAvailable ? "contained" : "outlined"}
                icon="cart-plus"
                onPress={() => addItemToCart(item.isAvailable, () => addToCart(item))}
              >
                {item.isAvailable ? "Add to Cart" : "Unavailable"}
              </Button>
              {!item.isAvailable ? (
                <Text variant="bodySmall" style={styles.unavailableHint}>
                  Reserved right now. You can choose a rental period above and try again.
                </Text>
              ) : null}
            </Card.Content>
          </Card>
        )}
      />

      <FAB
        icon="plus"
        label="New Equipment"
        style={styles.fab}
        onPress={() => navigation.navigate("EquipmentForm")}
      />

      <DatePickerModal
        locale="en-GB"
        mode="range"
        visible={isDateRangePickerVisible}
        onDismiss={() => setIsDateRangePickerVisible(false)}
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        saveLabel="Apply"
        label="Select rental period"
        onConfirm={({ startDate, endDate }) => {
          setIsDateRangePickerVisible(false);
          setDateRange({ startDate, endDate });

          if (startDate) {
            setRentalStartDate(formatDateForApi(startDate));
          }

          if (endDate) {
            setRentalEndDate(formatDateForApi(endDate));
          }
        }}
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
  emptyCard: {
    backgroundColor: "#ffffff",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 20,
  },
});
