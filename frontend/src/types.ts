export interface User {
  id: string;
  email: string;
  name: string;
  role: 'associate' | 'manager' | 'visual_merchandiser';
}

export interface Product {
  product_code: string;
  name: string;
  category: 'tshirt' | 'handbag';
  color: string;
  size: string;
  cost_price: number;
  selling_price: number;
  margin_percentage: number;
}

export interface WeeklySales {
  week_number: number;
  units_sold: number;
  revenue: number;
  profit: number;
  stock_level: number;
}

export interface Recommendation {
  id: string;
  product_code: string | null;
  action: string;
  reason: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  assigned_to: string | null;
  created_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  tasks_completed: number;
  tasks_total: number;
  success_rate: number;
}

export interface ActionPlan {
  steps: string[];
  tools_needed: string[];
  safety_notes: string[];
  estimated_time: string;
}

export interface SavedScene {
  id: string;
  name: string;
  thumbnail: string;
  timestamp: string;
  products: string[];
}

export interface DashboardMetrics {
  total_sales: number;
  total_units: number;
  total_transactions: number;
  total_profit: number;
}

export interface AIInsight {
  product_code: string;
  product_name: string;
  time_period: string;
  analysis: string;
  recommendation: {
    action: string;
    reason: string;
  };
}
