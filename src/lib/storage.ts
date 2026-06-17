import { RepairJob } from '@/types';
import { initialMockJobs } from '@/constants/mockData';

const STORAGE_KEY = 'repair_jobs';

export interface ImportResult {
  added: number;
  updated: number;
  unchanged: number;
  total: number;
  addedJobs: RepairJob[];
  updatedJobs: RepairJob[];
}

export const getJobs = (): RepairJob[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockJobs));
  return initialMockJobs;
};

export const saveJobs = (jobs: RepairJob[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
};

export const addJob = (job: Omit<RepairJob, 'id' | 'createdAt' | 'updatedAt'>): RepairJob => {
  const jobs = getJobs();
  const newJob: RepairJob = {
    ...job,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  jobs.unshift(newJob);
  saveJobs(jobs);
  return newJob;
};

export const updateJob = (id: string, updates: Partial<RepairJob>): RepairJob | null => {
  const jobs = getJobs();
  const index = jobs.findIndex(job => job.id === id);
  if (index === -1) return null;
  
  jobs[index] = {
    ...jobs[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveJobs(jobs);
  return jobs[index];
};

export const deleteJob = (id: string): boolean => {
  const jobs = getJobs();
  const filtered = jobs.filter(job => job.id !== id);
  if (filtered.length === jobs.length) return false;
  saveJobs(filtered);
  return true;
};

export const generateWhatsAppLink = (job: RepairJob, shopMobile: string): string => {
  const message = encodeURIComponent(
    `*Printer And Computer Repair*\n` +
    `Airport Road, Jazan\n` +
    `📞 ${shopMobile}\n\n` +
    `━━━━━━━━━━━━━━━\n` +
    `*Repair Job Details*\n` +
    `━━━━━━━━━━━━━━━\n\n` +
    `👤 Customer: ${job.customerName}\n` +
    `📱 Mobile: ${job.mobile}\n` +
    `🖥️ Device: ${job.deviceType}\n` +
    `📋 Model: ${job.brandModel}\n` +
    `🔧 Issue: ${job.problemDetails}\n` +
    `📅 Date: ${job.repairDate}\n` +
    `💰 Amount: ${job.amountCharged} ر.س\n\n` +
    `Thank you for choosing us!`
  );
  return `https://wa.me/${job.mobile.replace(/^0/, '966')}?text=${message}`;
};

export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('en-SA')} ر.س`;
};

// CSV Parsing utility
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map(v => v.trim());
};

const mapHeaderToField = (header: string): keyof RepairJob | null => {
  const normalized = header.toLowerCase().replace(/[\s_-]/g, '');
  const mapping: Record<string, keyof RepairJob> = {
    'id': 'id',
    'customername': 'customerName',
    'name': 'customerName',
    'customer': 'customerName',
    'mobile': 'mobile',
    'phone': 'mobile',
    'phonenumber': 'mobile',
    'devicetype': 'deviceType',
    'device': 'deviceType',
    'type': 'deviceType',
    'brandmodel': 'brandModel',
    'model': 'brandModel',
    'brand': 'brandModel',
    'serialnumber': 'serialNumber',
    'serial': 'serialNumber',
    'sn': 'serialNumber',
    'problemdetails': 'problemDetails',
    'problem': 'problemDetails',
    'fault': 'problemDetails',
    'issue': 'problemDetails',
    'description': 'problemDetails',
    'repairdate': 'repairDate',
    'date': 'repairDate',
    'amountcharged': 'amountCharged',
    'amount': 'amountCharged',
    'price': 'amountCharged',
    'cost': 'amountCharged',
    'notes': 'notes',
    'note': 'notes',
    'remark': 'notes',
    'status': 'status',
  };
  return mapping[normalized] || null;
};

export const parseCSV = (csvText: string): Partial<RepairJob>[] => {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, ''));
  const records: Partial<RepairJob>[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseCSVLine(lines[i]);
    const record: Partial<RepairJob> = {};

    headers.forEach((header, index) => {
      const value = (values[index] || '').replace(/^"|"$/g, '').trim();
      const key = mapHeaderToField(header);
      if (key && value) {
        if (key === 'amountCharged') {
          (record as Record<string, unknown>)[key] = parseFloat(value) || 0;
        } else if (key === 'deviceType') {
          const v = value as RepairJob['deviceType'];
          if (v === 'PC' || v === 'Laptop' || v === 'Printer') {
            record.deviceType = v;
          }
        } else if (key === 'status') {
          const v = value as RepairJob['status'];
          if (v === 'pending' || v === 'in-progress' || v === 'completed' || v === 'delivered') {
            record.status = v;
          }
        } else {
          (record as Record<string, unknown>)[key] = value;
        }
      }
    });

    if (record.customerName || record.mobile) {
      records.push(record);
    }
  }

  return records;
};

// Upsert with duplicate detection - update if changed, insert if new
export const upsertJobs = (importedJobs: Partial<RepairJob>[]): ImportResult => {
  const existingJobs = getJobs();
  const result: ImportResult = {
    added: 0,
    updated: 0,
    unchanged: 0,
    total: importedJobs.length,
    addedJobs: [],
    updatedJobs: [],
  };

  const updatedList = [...existingJobs];

  const trackedFields: (keyof RepairJob)[] = [
    'customerName', 'mobile', 'deviceType', 'brandModel', 'serialNumber',
    'problemDetails', 'repairDate', 'amountCharged', 'notes', 'status'
  ];

  for (const imported of importedJobs) {
    let existingIndex = -1;

    // Match priority: id > mobile + serialNumber > mobile + brandModel + repairDate
    if (imported.id) {
      existingIndex = updatedList.findIndex(j => j.id === imported.id);
    }

    if (existingIndex === -1 && imported.mobile && imported.serialNumber) {
      existingIndex = updatedList.findIndex(
        j => j.mobile === imported.mobile &&
             j.serialNumber === imported.serialNumber &&
             j.serialNumber !== ''
      );
    }

    if (existingIndex === -1 && imported.mobile && imported.brandModel && imported.repairDate) {
      existingIndex = updatedList.findIndex(
        j => j.mobile === imported.mobile &&
             j.brandModel === imported.brandModel &&
             j.repairDate === imported.repairDate
      );
    }

    if (existingIndex !== -1) {
      const existing = updatedList[existingIndex];
      const hasChanges = trackedFields.some(field => {
        if (imported[field] === undefined) return false;
        return existing[field] !== imported[field];
      });

      if (hasChanges) {
        const merged: RepairJob = {
          ...existing,
          ...imported,
          id: existing.id,
          createdAt: existing.createdAt,
          updatedAt: new Date().toISOString(),
        } as RepairJob;
        updatedList[existingIndex] = merged;
        result.updated++;
        result.updatedJobs.push(merged);
      } else {
        result.unchanged++;
      }
    } else {
      const newJob: RepairJob = {
        id: imported.id || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        customerName: imported.customerName || 'Unknown',
        mobile: imported.mobile || '',
        deviceType: imported.deviceType || 'PC',
        brandModel: imported.brandModel || '',
        serialNumber: imported.serialNumber || '',
        problemDetails: imported.problemDetails || '',
        repairDate: imported.repairDate || new Date().toISOString().split('T')[0],
        amountCharged: imported.amountCharged || 0,
        notes: imported.notes || '',
        status: imported.status || 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedList.unshift(newJob);
      result.added++;
      result.addedJobs.push(newJob);
    }
  }

  saveJobs(updatedList);
  return result;
};

// Preview without writing - same matching logic, but reports only
export const previewImport = (importedJobs: Partial<RepairJob>[]): {
  toAdd: Partial<RepairJob>[];
  toUpdate: Array<{ existing: RepairJob; incoming: Partial<RepairJob>; changedFields: string[] }>;
  unchanged: number;
} => {
  const existingJobs = getJobs();
  const toAdd: Partial<RepairJob>[] = [];
  const toUpdate: Array<{ existing: RepairJob; incoming: Partial<RepairJob>; changedFields: string[] }> = [];
  let unchanged = 0;

  const trackedFields: (keyof RepairJob)[] = [
    'customerName', 'mobile', 'deviceType', 'brandModel', 'serialNumber',
    'problemDetails', 'repairDate', 'amountCharged', 'notes', 'status'
  ];

  for (const imported of importedJobs) {
    let existing: RepairJob | undefined;

    if (imported.id) {
      existing = existingJobs.find(j => j.id === imported.id);
    }
    if (!existing && imported.mobile && imported.serialNumber) {
      existing = existingJobs.find(
        j => j.mobile === imported.mobile && j.serialNumber === imported.serialNumber && j.serialNumber !== ''
      );
    }
    if (!existing && imported.mobile && imported.brandModel && imported.repairDate) {
      existing = existingJobs.find(
        j => j.mobile === imported.mobile &&
             j.brandModel === imported.brandModel &&
             j.repairDate === imported.repairDate
      );
    }

    if (existing) {
      const changedFields = trackedFields.filter(field => {
        if (imported[field] === undefined) return false;
        return existing![field] !== imported[field];
      });
      if (changedFields.length > 0) {
        toUpdate.push({ existing, incoming: imported, changedFields });
      } else {
        unchanged++;
      }
    } else {
      toAdd.push(imported);
    }
  }

  return { toAdd, toUpdate, unchanged };
};

export const exportToCSV = (jobs: RepairJob[]): string => {
  const headers = ['id', 'customerName', 'mobile', 'deviceType', 'brandModel', 'serialNumber', 'problemDetails', 'repairDate', 'amountCharged', 'notes', 'status'];
  const escapeCSV = (val: unknown): string => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const rows = jobs.map(job =>
    headers.map(h => escapeCSV(job[h as keyof RepairJob])).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
};

export const downloadCSV = (csv: string, filename: string): void => {
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Group jobs by customer for the History view
export interface CustomerSummary {
  customerKey: string;
  customerName: string;
  mobile: string;
  jobs: RepairJob[];
  totalSpent: number;
  totalJobs: number;
  lastVisit: string;
  pendingCount: number;
  completedCount: number;
  outstandingBalance: number;
}

export const groupJobsByCustomer = (jobs: RepairJob[]): CustomerSummary[] => {
  const map = new Map<string, CustomerSummary>();

  for (const job of jobs) {
    const key = job.mobile || job.customerName;
    if (!map.has(key)) {
      map.set(key, {
        customerKey: key,
        customerName: job.customerName,
        mobile: job.mobile,
        jobs: [],
        totalSpent: 0,
        totalJobs: 0,
        lastVisit: job.repairDate,
        pendingCount: 0,
        completedCount: 0,
        outstandingBalance: 0,
      });
    }
    const summary = map.get(key)!;
    summary.jobs.push(job);
    summary.totalSpent += job.amountCharged;
    summary.totalJobs++;
    if (job.repairDate > summary.lastVisit) {
      summary.lastVisit = job.repairDate;
    }
    if (job.status === 'pending' || job.status === 'in-progress') {
      summary.pendingCount++;
    }
    if (job.status === 'completed' || job.status === 'delivered') {
      summary.completedCount++;
    }
    // Outstanding = amount owed for jobs not yet delivered (pending / in-progress / completed)
    if (job.status !== 'delivered') {
      summary.outstandingBalance += job.amountCharged;
    }
  }

  // Sort by outstanding balance high-to-low, then by last visit descending
  return Array.from(map.values()).sort((a, b) => {
    if (b.outstandingBalance !== a.outstandingBalance) {
      return b.outstandingBalance - a.outstandingBalance;
    }
    return b.lastVisit.localeCompare(a.lastVisit);
  });
};
