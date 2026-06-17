import { useState, useMemo } from 'react';
import { RepairJob } from '@/types';
import { CustomerSummary, formatCurrency, groupJobsByCustomer } from '@/lib/storage';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomerJobsDialog } from './CustomerJobsDialog';
import { ImportDialog } from './ImportDialog';
import {
  Search,
  Users,
  Upload,
  Download,
  User,
  Phone,
  Calendar,
  ClipboardList,
  ChevronRight,
  AlertCircle,
  ArrowDownWideNarrow,
} from 'lucide-react';
import { exportToCSV, downloadCSV } from '@/lib/storage';

interface CustomerHistoryProps {
  jobs: RepairJob[];
  onPrintLabel: (job: RepairJob) => void;
  onImport: (importedJobs: Partial<RepairJob>[]) => { added: number; updated: number; unchanged: number };
}

export const CustomerHistory = ({ jobs, onPrintLabel, onImport }: CustomerHistoryProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const customers = useMemo(() => groupJobsByCustomer(jobs), [jobs]);

  const filteredCustomers = customers.filter(c =>
    c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.mobile.includes(searchQuery)
  );

  const totalOutstanding = filteredCustomers.reduce(
    (sum, c) => sum + c.outstandingBalance,
    0
  );

  const handleExport = () => {
    const csv = exportToCSV(jobs);
    downloadCSV(csv, `customers-export-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleCustomerClick = (customer: CustomerSummary) => {
    // Refresh customer data with the latest job list
    const latestCustomer = customers.find(c => c.customerKey === customer.customerKey);
    setSelectedCustomer(latestCustomer || customer);
  };

  // Update selected customer if jobs change
  const liveSelectedCustomer = selectedCustomer
    ? customers.find(c => c.customerKey === selectedCustomer.customerKey) || null
    : null;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Users className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Customer Accounts</h2>
          <span className="text-sm text-muted-foreground">
            ({filteredCustomers.length} {filteredCustomers.length === 1 ? 'customer' : 'customers'})
          </span>
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-800 border-amber-200 text-xs gap-1"
          >
            <ArrowDownWideNarrow className="size-3" />
            Sorted by outstanding balance
          </Badge>
          {totalOutstanding > 0 && (
            <Badge
              variant="outline"
              className="bg-red-50 text-red-800 border-red-200 text-xs gap-1"
            >
              <AlertCircle className="size-3" />
              Total Outstanding: {formatCurrency(totalOutstanding)}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or mobile..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="size-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => setIsImportOpen(true)}>
            <Upload className="size-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

      {/* Customer Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
          <Users className="size-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-lg font-medium text-slate-600">
            {searchQuery ? 'No customers found' : 'No customers yet'}
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            {searchQuery ? 'Try a different search term' : 'Add a repair job to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map(customer => (
            <Card
              key={customer.customerKey}
              className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200 group"
              onClick={() => handleCustomerClick(customer)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="size-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm truncate">
                        {customer.customerName}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Phone className="size-3" />
                        {customer.mobile}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </div>

                <div
                  className={`rounded-lg p-3 mb-3 border ${
                    customer.outstandingBalance > 0
                      ? 'bg-red-50 border-red-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div
                    className={`text-xs font-medium flex items-center gap-1 ${
                      customer.outstandingBalance > 0 ? 'text-red-700' : 'text-slate-600'
                    }`}
                  >
                    <AlertCircle className="size-3" />
                    Outstanding Balance
                  </div>
                  <div
                    className={`text-xl font-bold truncate mt-0.5 ${
                      customer.outstandingBalance > 0
                        ? 'text-red-900'
                        : 'text-slate-700'
                    }`}
                  >
                    {formatCurrency(customer.outstandingBalance)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-blue-50 rounded p-2">
                    <div className="text-xs text-blue-700 font-medium flex items-center gap-1">
                      <ClipboardList className="size-3" />
                      Jobs
                    </div>
                    <div className="text-lg font-bold text-blue-900">
                      {customer.totalJobs}
                    </div>
                  </div>
                  <div className="bg-emerald-50 rounded p-2">
                    <div className="text-xs text-emerald-700 font-medium">Total Spent</div>
                    <div className="text-sm font-bold text-emerald-900 truncate">
                      {formatCurrency(customer.totalSpent)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="size-3" />
                    Last: {customer.lastVisit}
                  </div>
                  <div className="flex gap-1">
                    {customer.pendingCount > 0 && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-800 text-[10px] px-1.5 py-0">
                        {customer.pendingCount} active
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CustomerJobsDialog
        customer={liveSelectedCustomer}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onPrintLabel={onPrintLabel}
      />

      <ImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={onImport}
      />
    </div>
  );
};
