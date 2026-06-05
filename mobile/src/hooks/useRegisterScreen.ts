import { zodResolver } from "@hookform/resolvers/zod";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { generatedClientConfig } from "../api/generatedConfig";
import { usePostApiAuthRegister } from "../api/generated/react-query";
import { formatApiErrorForDisplay, parseApiError } from "../lib/apiError";
import type { RootStackParamList } from "../navigation/navigationTypes";
import { useAppToast } from "../providers/AppToastProvider";
import { useAuth } from "../providers/AuthProvider";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

const registerSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  displayName: z.string().min(1, "Name is required").max(200),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const useRegisterScreen = ({ navigation, route }: Pick<Props, "navigation" | "route">) => {
  const { showSuccess } = useAppToast();
  const { setSession, isAuthenticated } = useAuth();
  const redirectTo = route.params?.redirectTo;

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      displayName: "",
    },
  });

  const registerMutation = usePostApiAuthRegister({
    client: generatedClientConfig,
    mutation: {
      onSuccess: (data) => {
        setSession(data);
        showSuccess({ message: "Account created. You are signed in." });
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

  const submitError = registerMutation.isError
    ? formatApiErrorForDisplay(parseApiError(registerMutation.error))
    : null;

  return {
    form,
    registerMutation,
    submitError,
    redirectTo,
    onSubmit: form.handleSubmit((values) => {
      registerMutation.mutate({
        data: {
          email: values.email,
          password: values.password,
          displayName: values.displayName,
        },
      });
    }),
    onNavigateLogin: () => {
      navigation.navigate("Login", redirectTo ? { redirectTo } : undefined);
    },
    onNavigateBack: () => {
      navigation.navigate("Login", redirectTo ? { redirectTo } : undefined);
    },
  };
};
