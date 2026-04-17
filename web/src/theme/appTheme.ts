import { createTheme } from "@mui/material/styles";

declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    containedBlack: true;
  }
}

export const appTheme = createTheme({
  palette: {
    primary: { main: "#3B82F6", dark: "#2563EB", light: "#60A5FA", contrastText: "#ffffff" },
    secondary: { main: "#64748B", contrastText: "#ffffff" },
    success: { main: "#16A34A" },
    error: { main: "#DC2626" },
    warning: { main: "#D97706" },
    background: { default: "#F9FAFB", paper: "#FFFFFF" },
    divider: "#E2E8F0",
    text: {
      primary: "#0F172A",
      secondary: "#64748B",
    },
    action: { hover: "rgba(15, 23, 42, 0.06)", selected: "rgba(59, 130, 246, 0.12)" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h5: { fontWeight: 600, letterSpacing: "-0.01em" },
    h6: { fontWeight: 600 },
    subtitle2: { fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.7rem" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: "#F9FAFB" },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      variants: [
        {
          props: { variant: "containedBlack" },
          style: ({ theme }) => ({
            backgroundColor: theme.palette.common.black,
            color: theme.palette.common.white,
            "&:hover": { backgroundColor: "#1e293b" },
            "&.Mui-disabled": { backgroundColor: theme.palette.grey[300], color: theme.palette.grey[600] },
          }),
        },
      ],
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: "1px solid",
          borderColor: "#E2E8F0",
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontSize: "0.7rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "#64748B",
          backgroundColor: "#F8FAFC",
          borderBottom: "1px solid #E2E8F0",
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined", size: "small" },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: "#F8FAFC",
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderWidth: "1px" },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
  },
});
