import { useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Card, Menu, Switch, Text, TextInput } from "react-native-paper";

import { ScreenShell } from "../components/ScreenShell";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Category } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "EquipmentForm">;

const categoryOptions: Category[] = [
  { id: 1, name: "Lifting" },
  { id: 2, name: "Mixing" },
  { id: 3, name: "Diagnostics" },
];

export const EquipmentFormScreen = ({ navigation, route }: Props) => {
  const [name, setName] = useState<string>("");
  const [dailyRate, setDailyRate] = useState<string>("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  const selectedCategory = useMemo(
    () => categoryOptions.find((item) => item.id === categoryId),
    [categoryId],
  );

  const isEditMode = Boolean(route.params?.equipmentId);

  const onSubmit = () => {
    if (!name.trim() || !dailyRate || categoryId === null) {
      Alert.alert("Validation", "Complete all required fields before saving.");
      return;
    }

    Alert.alert(
      "Saved",
      `${isEditMode ? "Updated" : "Created"} equipment "${name}" successfully.`,
      [{ text: "OK", onPress: () => navigation.goBack() }],
    );
  };

  return (
    <ScreenShell
      title={isEditMode ? "Update Equipment" : "Create Equipment"}
      subtitle="Use this form to maintain your rental inventory catalog."
    >
      <Card style={styles.formCard}>
        <Card.Content style={styles.formContent}>
          <TextInput label="Equipment Name" value={name} mode="outlined" onChangeText={setName} />
          <TextInput
            label="Daily Rate"
            value={dailyRate}
            mode="outlined"
            keyboardType="decimal-pad"
            left={<TextInput.Affix text="$" />}
            onChangeText={setDailyRate}
          />

          <View>
            <Text variant="labelLarge" style={styles.fieldLabel}>
              Category
            </Text>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  icon="chevron-down"
                  contentStyle={styles.menuButtonContent}
                  onPress={() => setMenuVisible(true)}
                >
                  {selectedCategory?.name ?? "Select category"}
                </Button>
              }
            >
              {categoryOptions.map((category) => (
                <Menu.Item
                  key={category.id}
                  title={category.name}
                  onPress={() => {
                    setCategoryId(category.id);
                    setMenuVisible(false);
                  }}
                />
              ))}
            </Menu>
          </View>

          <View style={styles.switchRow}>
            <Text variant="titleMedium">Available for rental</Text>
            <Switch value={isAvailable} onValueChange={setIsAvailable} />
          </View>
        </Card.Content>
      </Card>

      <Button mode="contained" icon="content-save-outline" onPress={onSubmit}>
        {isEditMode ? "Update Equipment" : "Create Equipment"}
      </Button>
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: "#ffffff",
  },
  formContent: {
    gap: 14,
  },
  fieldLabel: {
    marginBottom: 6,
    color: "#334155",
  },
  menuButtonContent: {
    justifyContent: "space-between",
    flexDirection: "row-reverse",
  },
  switchRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
