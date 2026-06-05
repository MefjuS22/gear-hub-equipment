import { zodResolver } from "@hookform/resolvers/zod";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { generatedClientConfig } from "../api/generatedConfig";
import { usePostApiAuthLogin } from "../api/generated/react-query";
import { formatApiErrorForDisplay, parseApiError } from "../lib/apiError";
import type { RootStackParamList } from "../navigation/navigationTypes";
import { useAppToast } from "../providers/AppToastProvider";
import { useAuth } from "../providers/AuthProvider";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const useLoginScreen = ({ navigation, route }: Pick<Props, "navigation" | "route">) => {
  const { showSuccess } = useAppToast();
  const { setSession, isAuthenticated } = useAuth();
  const redirectTo = route.params?.redirectTo;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const login = usePostApiAuthLogin({
    client: generatedClientConfig,
    mutation: {
      onSuccess: (data) => {
        setSession(data);
        showSuccess({ message: "Signed in." });
        if (redirectTo) {
          navigation.reset({
            index: 0,
            routes: [{ name: "Main" }],
          });
        } else {
          navigation.goBack();
        }
      },
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    if (redirectTo) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [isAuthenticated, navigation, redirectTo]);

  const submitError = login.isError ? formatApiErrorForDisplay(parseApiError(login.error)) : null;

  return {
    form,
    login,
    submitError,
    redirectTo,
    onSubmit: form.handleSubmit((values) => {
      login.mutate({
        data: { email: values.email, password: values.password },
      });
    }),
    onNavigateRegister: () => {
      navigation.navigate("Register", redirectTo ? { redirectTo } : undefined);
    },
    onNavigateBack: () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate("Main");
      }
    },
  };
};
