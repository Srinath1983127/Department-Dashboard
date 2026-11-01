export interface RevenueDetail {
  id: string;
  description: string;
  amount: number;
}

export interface MonthFinancials {
  monthIndex: number; // 1 to 12
  monthName: string; // "Jan", "Feb", etc.
  directCost: number;
  overheadCost: number;
  actualRevenue: number;
  revenueDetails?: RevenueDetail[];
}

export interface ProjectMonthDistribution {
  monthIndex: number; // 1 to 12
  value: number;
}

export interface ProjectPerson {
  id: string;
  name: string;
  target: number;
  actual: number;
}

export interface DbPerson {
  id: string;
  name: string;
  role: string;
  daily_rate: number;
}

export type ProjectMethodology = 'scrum' | 'kanban';

export interface ProjectSprint {
  id: string;
  sprintNumber: number;
  name: string; // e.g., "Sprint 1", "MVP Sprint"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isAchieved?: boolean;
  achievedDate?: string;
  goal?: string;
}

export type DeliveryStatus = 'pending' | 'on_track' | 'at_risk' | 'delayed' | 'achieved';

export interface Project {
  id: string;
  name: string;
  category: string; // e.g., "Client Work", "Internal R&D", "Retainer"
  totalValue: number;
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  color: string;
  isExpanded?: boolean;
  monthlyForecast: number[]; // 12 elements for Month 1 to Month 12
  monthlyPersons?: ProjectPerson[][]; // 12 elements for Month 1 to Month 12
  invoicedMonths?: boolean[]; // 12 elements for Month 1 to Month 12
  nextYearRollover?: number;
  paymentMilestones?: { id: string; name: string; value: number }[];
  // Delivery Schedule & Agile/Kanban Tracking
  methodology?: ProjectMethodology; // 'scrum' | 'kanban'
  finalDeliveryDate?: string; // YYYY-MM-DD
  isDeliveryAchieved?: boolean;
  achievedDate?: string; // YYYY-MM-DD
  sprints?: ProjectSprint[]; // Sprints for Scrum Agile
  deliveryNotes?: string;
  client?: string;
  isPlannedFromForecast?: boolean;
  forecastId?: string;
}

export interface DepartmentConfig {
  id?: string;
  departmentName: string;
  yearlyBudget: number;
  fiscalYear: string;
  currencySymbol: string;
  targetMarginPercentage: number;
  lastYearLossProfit?: number;
}

export interface Developer {
  id: string;
  name: string;
  role: string;
  maxWeeklyHours: number;
  monthlyTarget?: number;
}

export interface ProjectAssignment {
  id: string;
  projectId: string;
  developerId: string;
  startDate: string;
  endDate: string;
  allocationPercentage: number;
  roleInProject: string;
  projectValue?: number;
  taskDescription?: string;
  invoiceType?: string;
}

export interface DepartmentPreset {
  id: string;
  label: string;
  description: string;
  config: DepartmentConfig;
  monthlyData: MonthFinancials[];
  projects: Project[];
}

export interface ProjectForecast {
  id: string;
  name: string;
  estimatedValue: number;
  priority: 'High' | 'Medium' | 'Low';
  status?: 'planned' | 'unplanned';
  cbsdDate?: string;
  devHandoverDate?: string;
  uatDate?: string;
  goLiveDate?: string;
}
