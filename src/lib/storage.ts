import { RepairJob } from '@/types';
import { initialMockJobs } from '@/constants/mockData';

const STORAGE_KEY = 'repair_jobs';

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
