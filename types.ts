export enum View {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  SEO = 'SEO',
  SUPPORT = 'SUPPORT',
  FILES = 'FILES',
  NEWS = 'NEWS',
  INVOICES = 'INVOICES',
  PRODUCT_GOOGLE = 'PRODUCT_GOOGLE',
  PRODUCT_INSTAGRAM = 'PRODUCT_INSTAGRAM',
  PRODUCT_AI_SEO = 'PRODUCT_AI_SEO',
  PRODUCT_WEBSITE = 'PRODUCT_WEBSITE',
  PRODUCT_CONTENT = 'PRODUCT_CONTENT',
  PRODUCT_META = 'PRODUCT_META',
  PRODUCT_BING = 'PRODUCT_BING',
  PRODUCT_BING_SEO = 'PRODUCT_BING_SEO',
  ACTION_PLAN = 'ACTION_PLAN',
  ADMIN = 'ADMIN',
  SETTINGS = 'SETTINGS',
}

export interface User {
  name: string;
  email: string;
  company: string;
}

export interface TeamMember {
  name: string;
  role: string;
  avatar: string;
}

export interface StatMetric {
  label: string;
  value: string;
  change: number; // percentage
  trend: 'up' | 'down';
}

export interface NewsItem {
  id: number;
  title: string;
  date: string;
  image: string;
  summary: string;
  readTime: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: 'Open' | 'Closed' | 'Pending';
  date: string;
}
