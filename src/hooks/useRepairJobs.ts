import { useState, useEffect, useCallback } from 'react';
import { RepairJob } from '@/types';
import { getJobs, saveJobs, addJob, updateJob, deleteJob } from '@/lib/storage';

export const useRepairJobs = () => {
  const [jobs, setJobs] = useState<RepairJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadedJobs = getJobs();
    setJobs(loadedJobs);
    setIsLoading(false);
  }, []);

  const createJob = useCallback((job: Omit<RepairJob, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newJob = addJob(job);
    setJobs(prev => [newJob, ...prev]);
    return newJob;
  }, []);

  const editJob = useCallback((id: string, updates: Partial<RepairJob>) => {
    const updated = updateJob(id, updates);
    if (updated) {
      setJobs(prev => prev.map(job => job.id === id ? updated : job));
    }
    return updated;
  }, []);

  const removeJob = useCallback((id: string) => {
    const success = deleteJob(id);
    if (success) {
      setJobs(prev => prev.filter(job => job.id !== id));
    }
    return success;
  }, []);

  const refreshJobs = useCallback(() => {
    const loadedJobs = getJobs();
    setJobs(loadedJobs);
  }, []);

  return {
    jobs,
    isLoading,
    createJob,
    editJob,
    removeJob,
    refreshJobs,
  };
};
