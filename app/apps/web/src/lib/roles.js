import {
  LayoutDashboard,
  GraduationCap,
  Building2,
  Target,
  FileText,
  Receipt,
  CreditCard,
  CalendarClock,
  Users,
  CheckSquare,
  BarChart3,
  Settings,
  ClipboardList,
} from 'lucide-react';

export const ROLES = {
  super_admin: 'Super Admin',
  manager: 'Manager',
  finance: 'Finance',
  sales: 'Sales',
  programme_pic: 'Programme PIC',
  trainer: 'Trainer',
  viewer: 'Viewer',
};

const ALL = Object.keys(ROLES);
const MANAGEMENT = ['super_admin', 'manager'];

/** Programme-centric navigation ordered by business flow */
export const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [{ path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ALL }],
  },
  {
    label: 'Pipeline',
    items: [
      { path: '/opportunities', label: 'Opportunities', icon: Target, roles: [...MANAGEMENT, 'sales'] },
      { path: '/quotations', label: 'Quotations', icon: FileText, roles: [...MANAGEMENT, 'sales', 'finance'] },
      { path: '/purchase-orders', label: 'Purchase Orders', icon: ClipboardList, roles: [...MANAGEMENT, 'sales', 'finance'] },
    ],
  },
  {
    label: 'Programmes',
    items: [
      { path: '/programmes', label: 'Programmes', icon: GraduationCap, roles: [...MANAGEMENT, 'programme_pic', 'trainer', 'viewer', 'sales', 'finance'] },
      { path: '/clients', label: 'Clients', icon: Building2, roles: [...MANAGEMENT, 'sales', 'finance', 'programme_pic'] },
      { path: '/training', label: 'Training Delivery', icon: CalendarClock, roles: [...MANAGEMENT, 'programme_pic', 'trainer'] },
      { path: '/participants', label: 'Participants', icon: Users, roles: [...MANAGEMENT, 'programme_pic', 'trainer'] },
    ],
  },
  {
    label: 'Finance',
    items: [
      { path: '/invoices', label: 'Invoices', icon: Receipt, roles: [...MANAGEMENT, 'finance'] },
      { path: '/payments', label: 'Payment Collection', icon: CreditCard, roles: [...MANAGEMENT, 'finance'] },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { path: '/action-items', label: 'Action Items', icon: CheckSquare, roles: ALL },
      { path: '/reports', label: 'Programme Reports', icon: BarChart3, roles: [...MANAGEMENT, 'finance', 'sales', 'viewer'] },
    ],
  },
  {
    label: 'System',
    items: [{ path: '/administration', label: 'Administration', icon: Settings, roles: ['super_admin'] }],
  },
];

export const canAccess = (role, path) => {
  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      if (item.path === path) return item.roles.includes(role);
    }
  }
  return false;
};

export const visibleSections = (role) =>
  NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.roles.includes(role)),
  })).filter((section) => section.items.length > 0);
