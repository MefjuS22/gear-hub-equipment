import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    primary: { main: "#001f3f", contrastText: "#ffffff" },
    secondary: { main: "#565f6e" },
    background: { default: "#f8f9fa", paper: "#ffffff" },
    divider: "#c4c6cf",
    text: {
      primary: "rgba(0, 0, 0, 0.87)",
      secondary: "#4a5560",
    },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
  },
});
