import { StyleSheet, View } from "react-native";
import { TextInput } from "react-native-paper";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export const CrudListSearchField = ({ value, onChangeText, placeholder = "Search…" }: Props) => {
  return (
    <View style={styles.wrap}>
      <TextInput
        mode="outlined"
        dense
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        left={<TextInput.Icon icon="magnify" />}
        right={value ? <TextInput.Icon icon="close" onPress={() => onChangeText("")} /> : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
  },
});
