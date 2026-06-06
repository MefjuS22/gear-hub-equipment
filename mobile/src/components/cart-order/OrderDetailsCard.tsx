import { StyleSheet, View } from "react-native";
import { Button, Card, HelperText, Text, TextInput } from "react-native-paper";
import type { UseFormReturn } from "react-hook-form";

import type { OrderFormValues } from "../../hooks/useCartOrderScreen";

type Props = {
  form: UseFormReturn<OrderFormValues>;
  dateRangeLabel: string;
  subtotal: number;
  isAuthenticated: boolean;
  companyNameError?: string;
  contactPersonError?: string;
  rentalStartDateError?: string;
  rentalEndDateError?: string;
  onOpenDateRangePicker: () => void;
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
};

export const OrderDetailsCard = ({
  form,
  dateRangeLabel,
  subtotal,
  isAuthenticated,
  companyNameError,
  contactPersonError,
  rentalStartDateError,
  rentalEndDateError,
  onOpenDateRangePicker,
  onNavigateLogin,
  onNavigateRegister,
}: Props) => {
  const companyName = form.watch("companyName");
  const contactPerson = form.watch("contactPerson");

  if (!isAuthenticated) {
    return (
      <Card style={styles.sectionCard}>
        <Card.Title title="Sign in to continue" />
        <Card.Content style={styles.cardContent}>
          <Text variant="bodyMedium" style={styles.hint}>
            Your cart is saved on this device. Sign in to enter company details
            and place the order.
          </Text>
          <Text variant="bodyMedium" style={styles.hint}>
            You need an account to place an order.
          </Text>
          <View style={styles.authActions}>
            <Button mode="contained" onPress={onNavigateLogin} contentStyle={styles.buttonContent}>
              Sign in to place order
            </Button>
            <Button
              mode="outlined"
              onPress={onNavigateRegister}
              contentStyle={styles.buttonContent}
            >
              Create account
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.sectionCard}>
      <Card.Title title="Order Details" />
      <Card.Content style={styles.cardContent}>
        <View>
          <Text variant="labelLarge" style={styles.fieldLabel}>
            Company details
          </Text>
          <TextInput
            label="Company / organization"
            mode="outlined"
            autoComplete="organization"
            value={companyName}
            onChangeText={(value) =>
              form.setValue("companyName", value, { shouldValidate: true, shouldDirty: true })
            }
            error={Boolean(companyNameError)}
          />
          <HelperText type="error" visible={Boolean(companyNameError)}>
            {companyNameError}
          </HelperText>

          <TextInput
            label="Contact person"
            mode="outlined"
            autoComplete="name"
            value={contactPerson}
            onChangeText={(value) =>
              form.setValue("contactPerson", value, { shouldValidate: true, shouldDirty: true })
            }
            error={Boolean(contactPersonError)}
          />
          <HelperText type="error" visible={Boolean(contactPersonError)}>
            {contactPersonError}
          </HelperText>

          <Text variant="bodySmall" style={styles.hint}>
            Pick a saved company or enter a new one.
          </Text>
        </View>

        <View>
          <Text variant="labelLarge" style={styles.fieldLabel}>
            Rental Period
          </Text>
          <Button
            mode="outlined"
            icon="calendar-range"
            contentStyle={styles.menuButtonContent}
            style={[
              styles.dateRangeButton,
              rentalStartDateError || rentalEndDateError ? styles.dateRangeButtonError : null,
            ]}
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
  hint: {
    color: "#64748b",
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
  authActions: {
    gap: 8,
    marginTop: 4,
  },
  buttonContent: {
    minHeight: 44,
  },
});
