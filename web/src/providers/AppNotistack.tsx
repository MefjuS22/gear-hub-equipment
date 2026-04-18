import { SnackbarProvider } from "notistack";

export function AppNotistackProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SnackbarProvider
      maxSnack={4}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      autoHideDuration={5000}
    >
      {children}
    </SnackbarProvider>
  );
}
