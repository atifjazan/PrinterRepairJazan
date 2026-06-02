import { CustomerSummary, formatCurrency, generateWhatsAppLink } from '@/lib/storage';
import { RepairJob } from '@/types';
import { SHOP_INFO, STATUS_OPTIONS } from '@/constants/config';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  User,
  Phone,
  ClipboardList,
  TrendingUp,
  Calendar,
  Printer,
  MessageCircle,
  Monitor,
  Laptop,
  PrinterIcon,
} from 'lucide-react';

interface CustomerJobsDialogProps {
  customer: CustomerSummary | null;
  isOpen: boolean;
  onClose: () => void;
  onPrintLabel: (job: RepairJob) => void;
}

const DeviceIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'PC':
      return <Monitor className="size-4" />;
    case 'Laptop':
      return <Laptop className="size-4" />;
    case 'Printer':
      return <PrinterIcon className="size-4" />;
    default:
      return <Monitor className="size-4" />;
  }
};

export const CustomerJobsDialog = ({
  customer,
  isOpen,
  onClose,
  onPrintLabel,
}: CustomerJobsDialogProps) => {
  if (!customer) return null;

  const sortedJobs = [...customer.jobs].sort((a, b) =>
    b.repairDate.localeCompare(a.repairDate)
  );

  const getStatusBadge = (status: RepairJob['status']) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status);
    return (
      <Badge variant="secondary" className={option?.color}>
        {option?.label || status}
      </Badge>
    );
  };

  const handleWhatsApp = (job: RepairJob) => {
    const link = generateWhatsAppLink(job, SHOP_INFO.mobile);
    window.open(link, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-3 border-b">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="size-5 text-primary" />
            </div>
            <div>
              <div>{customer.customerName}</div>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <Phone className="size-3" />
                {customer.mobile}
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-3">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 text-blue-700 text-xs font-medium">
              <ClipboardList className="size-3.5" />
              Total Jobs
            </div>
            <div className="text-2xl font-bold text-blue-900 mt-1">
              {customer.totalJobs}
            </div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-medium">
              <TrendingUp className="size-3.5" />
              Total Spent
            </div>
            <div className="text-2xl font-bold text-emerald-900 mt-1">
              {formatCurrency(customer.totalSpent)}
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
            <div className="flex items-center gap-2 text-amber-700 text-xs font-medium">
              <Calendar className="size-3.5" />
              Last Visit
            </div>
            <div className="text-lg font-bold text-amber-900 mt-1">
              {customer.lastVisit}
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <div className="text-xs font-medium text-slate-700">Status</div>
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {customer.pendingCount > 0 && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-800 text-xs">
                  {customer.pendingCount} active
                </Badge>
              )}
              {customer.completedCount > 0 && (
                <Badge variant="outline" className="bg-green-50 text-green-800 text-xs">
                  {customer.completedCount} done
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Complete Job List */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <ClipboardList className="size-4 text-primary" />
              Complete Job History ({sortedJobs.length})
            </h3>
          </div>

          <ScrollArea className="flex-1 border rounded-lg">
            <Table>
              <TableHeader className="sticky top-0 bg-slate-50 z-10">
                <TableRow>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Device</TableHead>
                  <TableHead className="font-semibold">Model / Serial</TableHead>
                  <TableHead className="font-semibold">Problem</TableHead>
                  <TableHead className="font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedJobs.map(job => (
                  <TableRow key={job.id} className="hover:bg-slate-50/50">
                    <TableCell className="text-sm font-medium whitespace-nowrap">
                      {job.repairDate}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DeviceIcon type={job.deviceType} />
                        <span className="text-sm">{job.deviceType}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{job.brandModel}</div>
                      {job.serialNumber && (
                        <div className="text-xs text-muted-foreground font-mono">
                          {job.serialNumber}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[250px]">
                      <div className="text-sm truncate" title={job.problemDetails}>
                        {job.problemDetails}
                      </div>
                      {job.notes && (
                        <div className="text-xs text-muted-foreground truncate italic" title={job.notes}>
                          Note: {job.notes}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-emerald-600 whitespace-nowrap">
                        {formatCurrency(job.amountCharged)}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => onPrintLabel(job)}
                          title="Print Label"
                        >
                          <Printer className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-green-600 hover:text-green-700"
                          onClick={() => handleWhatsApp(job)}
                          title="Send WhatsApp"
                        >
                          <MessageCircle className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
