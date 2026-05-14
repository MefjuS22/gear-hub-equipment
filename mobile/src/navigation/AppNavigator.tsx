import { RootDrawerNavigator } from "./RootDrawerNavigator";

export { type CatalogStackParamList, type ShopStackParamList } from "./navigationTypes";

export const AppNavigator = () => {
  return <RootDrawerNavigator />;
};
