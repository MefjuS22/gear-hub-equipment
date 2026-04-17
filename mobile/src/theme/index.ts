import { MD3LightTheme } from "react-native-paper";

export const appTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#001f3f",
    onPrimary: "#ffffff",
    secondary: "#565f6e",
    background: "#f8f9fa",
    surface: "#ffffff",
    surfaceVariant: "#e7e8e9",
    outline: "#c4c6cf",
  },
  roundness: 6,
};
