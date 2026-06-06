export type DashboardChartPoint = {
  label: string;
  value: number;
};

export type DashboardSummary = {
  totalOrders: number;
  ordersLast30Days: number;
  totalCustomers: number;
  totalEquipment: number;
  availableEquipment: number;
  loginsLast24Hours: number;
  uniqueUsersLoggedInLast24Hours: number;
  estimatedRevenueLast30Days: number;
};

export type DashboardStats = {
  summary: DashboardSummary;
  ordersByDay: DashboardChartPoint[];
  revenueByDay: DashboardChartPoint[];
  topEquipment: DashboardChartPoint[];
  loginsByDay: DashboardChartPoint[];
};
