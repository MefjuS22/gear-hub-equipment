import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, View } from "react-native";
import { Button, Card, HelperText, Text, TextInput } from "react-native-paper";

import { useLoginScreen } from "../../hooks/useLoginScreen";
import type { RootStackParamList } from "../../navigation/navigationTypes";
import { ScreenShell } from "../../components/ScreenShell";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export const LoginScreen = ({ navigation, route }: Props) => {
  const { form, login, submitError, onSubmit, onNavigateRegister, onNavigateBack } = useLoginScreen(
    {
      navigation,
      route,
    },
  );

  const {
    register,
    formState: { errors },
  } = form;

  return (
    <ScreenShell
      title="Sign in"
      subtitle="Use your GearHub account to place orders and access staff tools."
    >
      <Card style={styles.card} mode="outlined">
        <Card.Content style={styles.cardContent}>
          <Text variant="bodyMedium" style={styles.hint}>
            Need an account? Create one below.
          </Text>

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
            autoComplete="password"
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
              loading={login.isPending}
              disabled={login.isPending}
              onPress={onSubmit}
              contentStyle={styles.buttonContent}
            >
              {login.isPending ? "Signing in…" : "Sign in"}
            </Button>
            <Button mode="outlined" onPress={onNavigateRegister}>
              Create account
            </Button>
            <Button mode="text" onPress={onNavigateBack}>
              Back
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
