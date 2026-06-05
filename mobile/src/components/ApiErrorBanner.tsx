import { StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";

type ApiErrorBannerProps = {
  message: string;
};

export const ApiErrorBanner = ({ message }: ApiErrorBannerProps) => {
  return (
    <Card style={styles.card} mode="outlined">
      <Card.Content>
        <Text variant="bodyMedium" style={styles.message}>
          {message}
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  message: {
    color: "#991b1b",
  },
});
