
import { Template, UserDownload, DashboardStats, ApiListResponse } from '../types';
import { MOCK_TEMPLATES, MOCK_DOWNLOADS } from './mockData';

// Simulate latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Persistence Helper ---
const STORAGE_KEYS = {
  TEMPLATES: 'tp_templates_data',
  DOWNLOADS: 'tp_downloads_data'
};

const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to storage', e);
  }
};

// In-memory storage initialized from LocalStorage or Mock Data
let storedTemplates: Template[] = loadFromStorage(STORAGE_KEYS.TEMPLATES, [...MOCK_TEMPLATES]);
let storedDownloads: UserDownload[] = loadFromStorage(STORAGE_KEYS.DOWNLOADS, [...MOCK_DOWNLOADS]);

export const api = {
  getStats: async (): Promise<DashboardStats> => {
    await delay(500);
    // Calculate stats dynamically based on current data
    const totalDownloads = storedDownloads.length;
    const uniqueUsers = new Set(storedDownloads.map(d => d.whatsappNumber || d.userName)).size;
    
    // Simple revenue calc simulation (e.g. $0.50 per download)
    const revenue = totalDownloads * 0.50;

    // Simple trend simulation (last 10 downloads)
    const trend = Array(10).fill(0);
    // Group downloads by minute/hour for trend or just random for mock visual
    // For this mock, we'll just show a static visual or random noise based on recent activity
    const recent = storedDownloads.slice(0, 10);
    recent.forEach((_, i) => {
        trend[9 - i] = 1; // Simple tick
    });

    return {
      totalTemplates: storedTemplates.length,
      totalDownloads,
      activeUsers: uniqueUsers,
      revenue,
      downloadsTrend: totalDownloads > 0 ? trend : [0,0,0,0,0,0,0,0,0,0],
    };
  },

  getTemplates: async (params: { q?: string; page?: number; pageSize?: number }): Promise<ApiListResponse<Template>> => {
    await delay(600);
    let data = storedTemplates;
    if (params.q) {
      const lowerQ = params.q.toLowerCase();
      data = data.filter(t => t.name.toLowerCase().includes(lowerQ));
    }
    return {
      data,
      total: data.length,
      page: params.page || 1,
      pageSize: params.pageSize || 10
    };
  },

  getTemplate: async (id: string): Promise<Template> => {
    await delay(400);
    const t = storedTemplates.find(x => x.id === id);
    if (!t) throw new Error('Template not found');
    return t;
  },

  createTemplate: async (data: Omit<Template, 'id' | 'createdAt' | 'downloadCount' | 'thumbnailUrl'>): Promise<Template> => {
    await delay(800);
    const newTemplate: Template = {
      ...data,
      id: `t${Date.now()}`,
      createdAt: new Date().toISOString(),
      downloadCount: 0,
      thumbnailUrl: data.imageUrl, // In real app, server generates thumb
    };
    storedTemplates = [newTemplate, ...storedTemplates];
    saveToStorage(STORAGE_KEYS.TEMPLATES, storedTemplates);
    return newTemplate;
  },

  updateTemplate: async (id: string, data: Partial<Template>): Promise<Template> => {
    await delay(600);
    const index = storedTemplates.findIndex(x => x.id === id);
    if (index === -1) throw new Error('Template not found');
    
    storedTemplates[index] = { ...storedTemplates[index], ...data };
    saveToStorage(STORAGE_KEYS.TEMPLATES, storedTemplates);
    return storedTemplates[index];
  },

  deleteTemplate: async (id: string): Promise<void> => {
    await delay(500);
    storedTemplates = storedTemplates.filter(t => t.id !== id);
    saveToStorage(STORAGE_KEYS.TEMPLATES, storedTemplates);
  },

  // --- User/Download Data ---

  recordDownload: async (data: { templateId: string, templateName: string, userName: string, userPhoto?: string, whatsappNumber: string }): Promise<void> => {
    await delay(400);
    const newDownload: UserDownload = {
        id: `d${Date.now()}`,
        userName: data.userName,
        whatsappNumber: data.whatsappNumber,
        userPhoto: data.userPhoto,
        templateId: data.templateId,
        templateName: data.templateName,
        downloadedAt: new Date().toISOString(),
        status: 'completed'
    };
    
    // Add to downloads list
    storedDownloads = [newDownload, ...storedDownloads];
    saveToStorage(STORAGE_KEYS.DOWNLOADS, storedDownloads);
    
    // Increment template count
    const tIndex = storedTemplates.findIndex(t => t.id === data.templateId);
    if (tIndex >= 0) {
        storedTemplates[tIndex] = {
            ...storedTemplates[tIndex],
            downloadCount: storedTemplates[tIndex].downloadCount + 1
        };
        saveToStorage(STORAGE_KEYS.TEMPLATES, storedTemplates);
    }
  },

  getUsers: async (params: { q?: string; page?: number }): Promise<ApiListResponse<UserDownload>> => {
    await delay(500);
    let data = storedDownloads;
    if (params.q) {
      data = data.filter(d => 
        d.userName.toLowerCase().includes(params.q!.toLowerCase()) || 
        d.whatsappNumber.includes(params.q!)
      );
    }
    return {
      data,
      total: data.length,
      page: params.page || 1,
      pageSize: 10
    };
  },

  exportUsersCSV: async (from?: string, to?: string): Promise<string> => {
    await delay(1000);
    // Removed Status column as requested
    const header = 'ID,User Name,WhatsApp,Template,Date\n';
    const rows = storedDownloads.map(d => 
      `${d.id},"${d.userName}","${d.whatsappNumber}","${d.templateName}",${d.downloadedAt}`
    ).join('\n');
    return header + rows;
  }
};
