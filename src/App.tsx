import { useState } from 'react';
import { RepairJob } from '@/types';
import { useRepairJobs } from '@/hooks/useRepairJobs';
import { Header } from '@/components/layout/Header';
import { RepairForm } from '@/components/forms/RepairForm';
import { JobsTable } from '@/components/features/JobsTable';
import { StatsCards } from '@/components/features/StatsCards';
import { ThermalLabel } from '@/components/features/ThermalLabel';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { Search, Wrench } from 'lucide-react';

function App() {
  const { jobs, createJob, editJob, removeJob } = useRepairJobs();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<RepairJob | null>(null);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredJobs = jobs.filter(job =>
    job.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.mobile.includes(searchQuery) ||
    job.brandModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddJob = (jobData: Omit<RepairJob, 'id' | 'createdAt' | 'updatedAt'>) => {
    createJob(jobData);
    toast({
      title: 'Job Added',
      description: `Repair job for ${jobData.customerName} has been created.`,
    });
  };

  const handlePrintLabel = (job: RepairJob) => {
    setSelectedJob(job);
    setIsPrintDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    removeJob(id);
    toast({
      title: 'Job Deleted',
      description: 'The repair job has been removed.',
      variant: 'destructive',
    });
  };

  const handleStatusChange = (id: string, status: RepairJob['status']) => {
    editJob(id, { status });
    toast({
      title: 'Status Updated',
      description: `Job status changed to ${status}.`,
    });
  };

  return (
    <div className="min-h-screen bg-base">
      <Header />
      
      <main className="p-6">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Stats Overview */}
          <StatsCards jobs={jobs} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Section */}
            <div className="lg:col-span-4">
              <RepairForm onSubmit={handleAddJob} />
            </div>

            {/* Jobs List Section */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Wrench className="size-5 text-primary" />
                  <h2 className="text-lg font-semibold">Repair Jobs</h2>
                  <span className="text-sm text-muted-foreground">
                    ({filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'})
                  </span>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <JobsTable
                jobs={filteredJobs}
                onPrintLabel={handlePrintLabel}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Thermal Label Dialog */}
      {selectedJob && (
        <ThermalLabel
          job={selectedJob}
          isOpen={isPrintDialogOpen}
          onClose={() => {
            setIsPrintDialogOpen(false);
            setSelectedJob(null);
          }}
        />
      )}

      <Toaster />
    </div>
  );
}

export default App;
