
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface PlaceholderConfig {
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  width: number; // Percentage 0-100
  height: number; // Percentage 0-100
  shape: 'rect' | 'circle';
}

export interface TextFieldConfig {
  x: number; // Percentage
  y: number; // Percentage
  width: number; // Percentage
  height: number; // Percentage
  color: string;
  fontSize: number; // Relative scale unit (approx px at standard view)
  align: 'left' | 'center' | 'right';
  fontFamily: string;
}

export interface Template {
  id: string;
  name: string;
  imageUrl: string;
  thumbnailUrl: string;
  placeholder: PlaceholderConfig;
  nameField?: TextFieldConfig;
  createdAt: string;
  downloadCount: number;
}

export interface UserDownload {
  id: string;
  userName: string;
  userEmail?: string;
  whatsappNumber: string; // Added field
  userPhoto?: string; // Stored as Data URI for mock purposes
  templateId: string;
  templateName: string;
  downloadedAt: string;
  status: 'completed' | 'failed';
}

export interface DashboardStats {
  totalTemplates: number;
  totalDownloads: number;
  activeUsers: number;
  revenue: number;
  downloadsTrend: number[]; // Sparkline data
}

export interface ApiListResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
