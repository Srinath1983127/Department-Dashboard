import { DepartmentPreset, MonthFinancials, Project } from '../types';

export const MONTH_NAMES = [
  'Month 1 (Apr)',
  'Month 2 (May)',
  'Month 3 (Jun)',
  'Month 4 (Jul)',
  'Month 5 (Aug)',
  'Month 6 (Sep)',
  'Month 7 (Oct)',
  'Month 8 (Nov)',
  'Month 9 (Dec)',
  'Month 10 (Jan)',
  'Month 11 (Feb)',
  'Month 12 (Mar)'
];

export const SHORT_MONTH_NAMES = [
  'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'
];

export const PROJECT_CATEGORIES = [
  'Software & Product Dev',
  'Client Services',
  'Infrastructure & Cloud',
  'Marketing Campaign',
  'R&D Innovation',
  'Consulting & Support'
];

export const DEFAULT_PRESETS: DepartmentPreset[] = [
  {
    id: 'software-dev-alpha-team',
    label: 'Software Development-Alpha Team',
    description: 'High direct payroll costs, SaaS project forecasts, and scalable client deliverables.',
    config: {
      departmentName: 'Software Development-Alpha Team',
      yearlyBudget: 84000000,
      fiscalYear: '2025-2026',
      currencySymbol: 'LKR',
      targetMarginPercentage: 20,
      lastYearLossProfit: 0
    },
    monthlyData: [
      { monthIndex: 1, monthName: 'Month 1 (Apr)', directCost: 45000, overheadCost: 15000, actualRevenue: 75000 },
      { monthIndex: 2, monthName: 'Month 2 (May)', directCost: 48000, overheadCost: 15000, actualRevenue: 82000 },
      { monthIndex: 3, monthName: 'Month 3 (Jun)', directCost: 52000, overheadCost: 16000, actualRevenue: 95000 },
      { monthIndex: 4, monthName: 'Month 4 (Jul)', directCost: 50000, overheadCost: 16000, actualRevenue: 88000 },
      { monthIndex: 5, monthName: 'Month 5 (Aug)', directCost: 55000, overheadCost: 17000, actualRevenue: 105000 },
      { monthIndex: 6, monthName: 'Month 6 (Sep)', directCost: 58000, overheadCost: 17000, actualRevenue: 110000 },
      { monthIndex: 7, monthName: 'Month 7 (Oct)', directCost: 60000, overheadCost: 18000, actualRevenue: 115000 },
      { monthIndex: 8, monthName: 'Month 8 (Nov)', directCost: 62000, overheadCost: 18000, actualRevenue: 120000 },
      { monthIndex: 9, monthName: 'Month 9 (Dec)', directCost: 65000, overheadCost: 19000, actualRevenue: 130000 },
      { monthIndex: 10, monthName: 'Month 10 (Jan)', directCost: 64000, overheadCost: 19000, actualRevenue: 125000 },
      { monthIndex: 11, monthName: 'Month 11 (Feb)', directCost: 68000, overheadCost: 20000, actualRevenue: 140000 },
      { monthIndex: 12, monthName: 'Month 12 (Mar)', directCost: 70000, overheadCost: 20000, actualRevenue: 150000 }
    ],
    projects: [
      {
        id: 'p1',
        name: 'Enterprise Cloud Portal Migration',
        category: 'Infrastructure & Cloud',
        totalValue: 360000,
        status: 'active',
        color: '#3b82f6',
        isExpanded: true,
        monthlyForecast: [20000, 25000, 30000, 30000, 35000, 35000, 35000, 30000, 30000, 30000, 30000, 30000],
        methodology: 'scrum',
        finalDeliveryDate: '2026-11-30',
        isDeliveryAchieved: false,
        deliveryNotes: 'Multi-cloud Kubernetes cluster migration and legacy DB sync.',
        sprints: [
          {
            id: 'p1_sp1',
            sprintNumber: 1,
            name: 'Sprint 1: Cloud Infra Setup',
            startDate: '2026-09-01',
            endDate: '2026-09-15',
            isAchieved: true,
            achievedDate: '2026-09-14',
            goal: 'Provision VPC, IAM, and Terraform clusters'
          },
          {
            id: 'p1_sp2',
            sprintNumber: 2,
            name: 'Sprint 2: Service Migration',
            startDate: '2026-09-16',
            endDate: '2026-09-30',
            isAchieved: false,
            goal: 'Migrate microservices and container networking'
          },
          {
            id: 'p1_sp3',
            sprintNumber: 3,
            name: 'Sprint 3: Database & Cutover',
            startDate: '2026-10-01',
            endDate: '2026-10-15',
            isAchieved: false,
            goal: 'Data sync and zero-downtime cutover rehearsal'
          }
        ]
      },
      {
        id: 'p2',
        name: 'AI Analytics Engine Module',
        category: 'Software & Product Dev',
        totalValue: 240000,
        status: 'active',
        color: '#10b981',
        isExpanded: false,
        monthlyForecast: [10000, 15000, 15000, 20000, 20000, 25000, 25000, 25000, 25000, 20000, 20000, 20000],
        methodology: 'kanban',
        finalDeliveryDate: '2026-10-15',
        isDeliveryAchieved: true,
        achievedDate: '2026-10-12',
        deliveryNotes: 'Continuous delivery pipeline integrated with automated regression tests.'
      },
      {
        id: 'p3',
        name: 'Mobile App V2 Redesign',
        category: 'Client Services',
        totalValue: 180000,
        status: 'planning',
        color: '#8b5cf6',
        isExpanded: false,
        monthlyForecast: [0, 0, 10000, 15000, 20000, 25000, 25000, 25000, 20000, 15000, 15000, 10000],
        methodology: 'scrum',
        finalDeliveryDate: '2026-12-20',
        isDeliveryAchieved: false,
        deliveryNotes: 'iOS and Android redesign with React Native.',
        sprints: [
          {
            id: 'p3_sp1',
            sprintNumber: 1,
            name: 'Sprint 1: UI/UX Wireframing',
            startDate: '2026-10-01',
            endDate: '2026-10-14',
            isAchieved: false,
            goal: 'Figma prototypes and user validation testing'
          },
          {
            id: 'p3_sp2',
            sprintNumber: 2,
            name: 'Sprint 2: Component Library',
            startDate: '2026-10-15',
            endDate: '2026-10-29',
            isAchieved: false,
            goal: 'Build reusable UI design tokens and components'
          }
        ]
      }
    ]
  },
  {
    id: 'mktg-growth-2026',
    label: 'Marketing & Digital Growth',
    description: 'Ad spend direct costs, agency retainer overheads, and campaign revenue projections.',
    config: {
      departmentName: 'Global Marketing & Brand Growth',
      yearlyBudget: 850000,
      fiscalYear: '2026',
      currencySymbol: 'LKR',
      targetMarginPercentage: 20
    },
    monthlyData: [
      { monthIndex: 1, monthName: 'Month 1 (Apr)', directCost: 30000, overheadCost: 12000, actualRevenue: 55000 },
      { monthIndex: 2, monthName: 'Month 2 (May)', directCost: 32000, overheadCost: 12000, actualRevenue: 58000 },
      { monthIndex: 3, monthName: 'Month 3 (Jun)', directCost: 40000, overheadCost: 13000, actualRevenue: 72000 },
      { monthIndex: 4, monthName: 'Month 4 (Jul)', directCost: 38000, overheadCost: 13000, actualRevenue: 68000 },
      { monthIndex: 5, monthName: 'Month 5 (Aug)', directCost: 42000, overheadCost: 14000, actualRevenue: 80000 },
      { monthIndex: 6, monthName: 'Month 6 (Sep)', directCost: 45000, overheadCost: 14000, actualRevenue: 85000 },
      { monthIndex: 7, monthName: 'Month 7 (Oct)', directCost: 48000, overheadCost: 15000, actualRevenue: 90000 },
      { monthIndex: 8, monthName: 'Month 8 (Nov)', directCost: 50000, overheadCost: 15000, actualRevenue: 95000 },
      { monthIndex: 9, monthName: 'Month 9 (Dec)', directCost: 52000, overheadCost: 16000, actualRevenue: 102000 },
      { monthIndex: 10, monthName: 'Month 10 (Jan)', directCost: 55000, overheadCost: 16000, actualRevenue: 110000 },
      { monthIndex: 11, monthName: 'Month 11 (Feb)', directCost: 65000, overheadCost: 18000, actualRevenue: 135000 },
      { monthIndex: 12, monthName: 'Month 12 (Mar)', directCost: 70000, overheadCost: 18000, actualRevenue: 145000 }
    ],
    projects: [
      {
        id: 'p101',
        name: 'Q3 Global Paid Search & Social',
        category: 'Marketing Campaign',
        totalValue: 240000,
        status: 'active',
        color: '#f59e0b',
        isExpanded: true,
        monthlyForecast: [15000, 15000, 20000, 20000, 20000, 25000, 25000, 25000, 25000, 25000, 12500, 12500]
      },
      {
        id: 'p102',
        name: 'SEO & Content Syndication Push',
        category: 'Consulting & Support',
        totalValue: 120000,
        status: 'active',
        color: '#ec4899',
        isExpanded: false,
        monthlyForecast: [10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000]
      }
    ]
  },
  {
    id: 'blank-slate',
    label: 'Empty Slate (New Department)',
    description: 'Clean slate with zero values to build your own department model from scratch.',
    config: {
      departmentName: 'New Department',
      yearlyBudget: 500000,
      fiscalYear: '2026',
      currencySymbol: 'LKR',
      targetMarginPercentage: 20
    },
    monthlyData: Array.from({ length: 12 }, (_, i) => ({
      monthIndex: i + 1,
      monthName: MONTH_NAMES[i],
      directCost: 0,
      overheadCost: 0,
      actualRevenue: 0
    })),
    projects: [
      {
        id: 'p_new1',
        name: 'Project Alpha',
        category: 'Client Services',
        totalValue: 120000,
        status: 'planning',
        color: '#06b6d4',
        isExpanded: true,
        monthlyForecast: Array(12).fill(10000)
      }
    ]
  }
];
