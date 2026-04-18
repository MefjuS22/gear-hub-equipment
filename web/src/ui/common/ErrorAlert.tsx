import { Alert, type AlertProps } from "@mui/material";

type ErrorAlertProps = {
  message: string;
} & Pick<AlertProps, "sx">;

export function ErrorAlert({ message, sx }: ErrorAlertProps) {
  return (
    <Alert severity="error" sx={sx}>
      {message}
    </Alert>
  );
}
