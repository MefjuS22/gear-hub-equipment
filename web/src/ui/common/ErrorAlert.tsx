import { Alert, type AlertProps } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

type ErrorAlertProps = {
  message: string;
} & Pick<AlertProps, "sx">;

const preLine: SxProps<Theme> = {
  "& .MuiAlert-message": { whiteSpace: "pre-line" },
};

export function ErrorAlert({ message, sx }: ErrorAlertProps) {
  return (
    <Alert
      severity="error"
      sx={[preLine, ...(sx !== undefined ? [sx] : [])] as SxProps<Theme>}
    >
      {message}
    </Alert>
  );
}
