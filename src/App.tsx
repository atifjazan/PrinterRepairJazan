import { useState } from 'react';
import { RepairJob } from '@/types';
import { useRepairJobs } from '@/hooks/useRepairJobs';
import { Header } from '@/components/layout/Header';
import { RepairForm } from '@/components/forms/RepairForm';
import { JobsTable } from '@/components/features/JobsTable';
import { StatsCards } from '@/components/features/StatsCards';
import { ThermalLabel } from '@/components/features/ThermalLabel';
import { CustomerHistory } from '@/components/features/CustomerHistory';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Wrench, Users } from 'lucide-react';

function App() {
  const { jobs, createJob, editJob, removeJob, importJobs } = useRepairJobs();
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

  const handleImport = (importedJobs: Partial<RepairJob>[]) => {
    const result = importJobs(importedJobs);
    return {
      added: result.added,
      updated: result.updated,
      unchanged: result.unchanged,
    };
  };

  return (
    <div className="min-h-screen bg-base">
      <Header />

      <main className="p-6">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Stats Overview */}
          <StatsCards jobs={jobs} />

          {/* Tabs */}
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <Wrench className="size-4" />
                Active Jobs
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Users className="size-4" />
                Customer History
              </TabsTrigger>
            </TabsList>

            {/* Active Jobs Tab */}
            <TabsContent value="active" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4">
                  <RepairForm onSubmit={handleAddJob} />
                </div>

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
            </TabsContent>

            {/* Customer History Tab */}
            <TabsContent value="history" className="mt-6">
              <CustomerHistory
                jobs={jobs}
                onPrintLabel={handlePrintLabel}
                onImport={handleImport}
              />
            </TabsContent>
          </Tabs>
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
