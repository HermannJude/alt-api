export enum EfficiencyRating {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  AVERAGE = 'average',
  POOR = 'poor',
}

export type WarningLevel = 'high' | 'medium' | 'low';

export interface DepartmentCostItem {
  department: string;
  total_monthly_cost: number;
  tools_count: number;
  total_users: number;
  average_cost_per_tool: number;
  cost_percentage: number;
}

export interface DepartmentCostSummary {
  data: DepartmentCostItem[];
  total_cost: number;
  most_expensive_department?: string | null;
}

export interface ExpensiveToolItem {
  id: number;
  name: string;
  vendor: string;
  monthly_cost: number;
  active_users: number;
  cost_per_user: number | null;
  efficiency_rating: EfficiencyRating;
}

export interface ExpensiveToolAnalysis {
  data: ExpensiveToolItem[];
  total_tools_analyzed: number;
  potential_savings_identified: number;
}

export interface ToolsByCategoryItem {
  category_id: number;
  category_name: string;
  total_cost: number;
  tools_count: number;
  total_users: number;
  percentage_of_budget: number;
  average_cost_per_user: number | null;
}

export interface ToolsByCategoryInsights {
  data: ToolsByCategoryItem[];
  most_expensive_category?: string | null;
  most_efficient_category?: string | null;
}

export interface LowUsageToolItem {
  id: number;
  name: string;
  vendor: string;
  monthly_cost: number;
  active_users: number;
  cost_per_user: number | null;
  warning_level: WarningLevel;
  potential_action: string;
}

export interface LowUsageSavingsAnalysis {
  data: LowUsageToolItem[];
  monthly_savings: number;
  annual_savings: number;
}

export interface VendorSummaryItem {
  vendor: string;
  tools_count: number;
  total_monthly_cost: number;
  total_users: number;
  departments: string[];
  cost_per_user: number | null;
  efficiency_rating: EfficiencyRating;
}

export interface VendorInsights {
  data: VendorSummaryItem[];
  most_expensive_vendor?: string | null;
  most_efficient_vendor?: string | null;
  single_tool_vendors_count: number;
}
