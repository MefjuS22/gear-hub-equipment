import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Icon } from "react-native-paper";

/** Matches web portal catalog: grey tile + package icon (see `PortalCatalogView.tsx`). */
const PLACEHOLDER_BG = "#e5e7eb";
const PLACEHOLDER_ICON = "#94a3b8";

type Props = {
  /** Outer box width and height (square). */
  size: number;
  /** Icon diameter; defaults to ~40% of `size` (similar to web list 56px / 22px). */
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
};

export const EquipmentImagePlaceholder = ({ size, iconSize, style }: Props) => {
  const resolvedIcon = iconSize ?? Math.max(20, Math.round(size * 0.39));
  return (
    <View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: 8,
        },
        style,
      ]}
    >
      <Icon source="package-variant" size={resolvedIcon} color={PLACEHOLDER_ICON} />
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    backgroundColor: PLACEHOLDER_BG,
    alignItems: "center",
    justifyContent: "center",
  },
});
