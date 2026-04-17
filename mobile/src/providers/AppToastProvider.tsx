import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { Portal, Snackbar } from "react-native-paper";

type ToastVariant = "success" | "error" | "info";

type ShowToastOptions = {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onDismiss?: () => void;
};

type ToastState = ShowToastOptions & {
  visible: boolean;
};

type AppToastContextValue = {
  showToast: (options: ShowToastOptions) => void;
  showSuccess: (options: Omit<ShowToastOptions, "variant">) => void;
  showError: (options: Omit<ShowToastOptions, "variant">) => void;
  showInfo: (options: Omit<ShowToastOptions, "variant">) => void;
  hideToast: () => void;
};

const AppToastContext = createContext<AppToastContextValue | null>(null);

export const AppToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastState | null>(null);

  const hideToast = useCallback(() => {
    setToast((previousToast) => {
      if (!previousToast) {
        return null;
      }

      previousToast.onDismiss?.();
      return null;
    });
  }, []);

  const showToast = useCallback((options: ShowToastOptions) => {
    setToast({
      visible: true,
      duration: 2200,
      variant: "info",
      ...options,
    });
  }, []);

  const showSuccess = useCallback(
    (options: Omit<ShowToastOptions, "variant">) => {
      showToast({
        ...options,
        variant: "success",
      });
    },
    [showToast],
  );

  const showError = useCallback(
    (options: Omit<ShowToastOptions, "variant">) => {
      showToast({
        ...options,
        variant: "error",
      });
    },
    [showToast],
  );

  const showInfo = useCallback(
    (options: Omit<ShowToastOptions, "variant">) => {
      showToast({
        ...options,
        variant: "info",
      });
    },
    [showToast],
  );

  const contextValue = useMemo(
    () => ({
      showToast,
      showSuccess,
      showError,
      showInfo,
      hideToast,
    }),
    [hideToast, showError, showInfo, showSuccess, showToast],
  );

  return (
    <AppToastContext.Provider value={contextValue}>
      {children}
      <Portal>
        <Snackbar
          visible={Boolean(toast?.visible)}
          onDismiss={hideToast}
          duration={toast?.duration}
          style={[
            styles.toast,
            toast?.variant === "success" ? styles.successToast : null,
            toast?.variant === "error" ? styles.errorToast : null,
          ]}
          wrapperStyle={styles.toastWrapper}
          action={{
            label: "Close",
            onPress: hideToast,
          }}
        >
          {toast?.message ?? ""}
        </Snackbar>
      </Portal>
    </AppToastContext.Provider>
  );
};

export const useAppToast = () => {
  const context = useContext(AppToastContext);
  if (!context) {
    throw new Error("useAppToast must be used within AppToastProvider.");
  }

  return context;
};

const styles = StyleSheet.create({
  toastWrapper: {
    left: 0,
    right: 0,
    bottom: 0,
  },
  toast: {
    margin: 0,
    borderRadius: 0,
    backgroundColor: "#1e293b",
  },
  successToast: {
    backgroundColor: "#0f766e",
  },
  errorToast: {
    backgroundColor: "#b91c1c",
  },
});
