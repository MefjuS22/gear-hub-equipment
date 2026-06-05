import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, View } from "react-native";
import { Button, Card, HelperText, Text, TextInput } from "react-native-paper";

import { ScreenShell } from "../../components/ScreenShell";
import { useRegisterScreen } from "../../hooks/useRegisterScreen";
import type { RootStackParamList } from "../../navigation/navigationTypes";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export const RegisterScreen = ({ navigation, route }: Props) => {
  const { form, registerMutation, submitError, onSubmit, onNavigateLogin, onNavigateBack } =
    useRegisterScreen({
      navigation,
      route,
    });

  const {
    register,
    formState: { errors },
  } = form;

  return (
    <ScreenShell
      title="Create account"
      subtitle="Signing up creates a staff account with the standard User role."
    >
      <Card style={styles.card} mode="outlined">
        <Card.Content style={styles.cardContent}>
          <Text variant="bodyMedium" style={styles.hint}>
            Already have an account? Sign in instead.
          </Text>

          <TextInput
            label="Display name"
            mode="outlined"
            error={Boolean(errors.displayName)}
            {...register("displayName")}
            onChangeText={(value) => form.setValue("displayName", value, { shouldValidate: true })}
            value={form.watch("displayName")}
          />
          <HelperText type="error" visible={Boolean(errors.displayName)}>
            {errors.displayName?.message}
          </HelperText>

          <TextInput
            label="Email"
            mode="outlined"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            error={Boolean(errors.email)}
            {...register("email")}
            onChangeText={(value) => form.setValue("email", value, { shouldValidate: true })}
            value={form.watch("email")}
          />
          <HelperText type="error" visible={Boolean(errors.email)}>
            {errors.email?.message}
          </HelperText>

          <TextInput
            label="Password"
            mode="outlined"
            secureTextEntry
            autoComplete="new-password"
            error={Boolean(errors.password)}
            {...register("password")}
            onChangeText={(value) => form.setValue("password", value, { shouldValidate: true })}
            value={form.watch("password")}
          />
          <HelperText type="error" visible={Boolean(errors.password)}>
            {errors.password?.message}
          </HelperText>

          {submitError ? (
            <Text variant="bodyMedium" style={styles.error}>
              {submitError}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <Button
              mode="contained"
              loading={registerMutation.isPending}
              disabled={registerMutation.isPending}
              onPress={onSubmit}
              contentStyle={styles.buttonContent}
            >
              {registerMutation.isPending ? "Creating…" : "Create account"}
            </Button>
            <Button mode="outlined" onPress={onNavigateLogin}>
              Back to sign in
            </Button>
            <Button mode="text" onPress={onNavigateBack}>
              Cancel
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
  },
  cardContent: {
    gap: 4,
  },
  hint: {
    color: "#64748b",
    marginBottom: 8,
  },
  error: {
    color: "#b42318",
    marginTop: 4,
  },
  actions: {
    gap: 8,
    marginTop: 8,
  },
  buttonContent: {
    minHeight: 48,
  },
});
