import { RepairJob } from '@/types';
import { STATUS_OPTIONS, SHOP_INFO } from '@/constants/config';
import { formatCurrency, generateWhatsAppLink } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  MoreHorizontal,
  Printer,
  MessageCircle,
  Trash2,
  Monitor,
  Laptop,
  PrinterIcon,
} from 'lucide-react';
import { useState } from 'react';

interface JobsTableProps {
  jobs: RepairJob[];
  onPrintLabel: (job: RepairJob) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: RepairJob['status']) => void;
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

export const JobsTable = ({ jobs, onPrintLabel, onDelete, onStatusChange }: JobsTableProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
        <PrinterIcon className="size-12 mx-auto text-slate-400 mb-3" />
        <h3 className="text-lg font-medium text-slate-600">No repair jobs yet</h3>
        <p className="text-slate-500 text-sm mt-1">Add your first repair job using the form above</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold">Customer</TableHead>
              <TableHead className="font-semibold">Device</TableHead>
              <TableHead className="font-semibold">Problem</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Amount</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map(job => (
              <TableRow key={job.id} className="hover:bg-slate-50/50">
                <TableCell>
                  <div className="font-medium">{job.customerName}</div>
                  <div className="text-sm text-muted-foreground">{job.mobile}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <DeviceIcon type={job.deviceType} />
                    <div>
                      <div className="font-medium text-sm">{job.deviceType}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {job.brandModel}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm truncate max-w-[200px]" title={job.problemDetails}>
                    {job.problemDetails}
                  </div>
                </TableCell>
                <TableCell className="text-sm">{job.repairDate}</TableCell>
                <TableCell>
                  <span className="font-semibold text-emerald-600">
                    {formatCurrency(job.amountCharged)}
                  </span>
                </TableCell>
                <TableCell>{getStatusBadge(job.status)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onPrintLabel(job)}>
                        <Printer className="size-4 mr-2" />
                        Print Label
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleWhatsApp(job)}>
                        <MessageCircle className="size-4 mr-2" />
                        Send WhatsApp
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onStatusChange(job.id, 'pending')}
                        disabled={job.status === 'pending'}
                      >
                        Mark Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onStatusChange(job.id, 'in-progress')}
                        disabled={job.status === 'in-progress'}
                      >
                        Mark In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onStatusChange(job.id, 'completed')}
                        disabled={job.status === 'completed'}
                      >
                        Mark Completed
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onStatusChange(job.id, 'delivered')}
                        disabled={job.status === 'delivered'}
                      >
                        Mark Delivered
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteId(job.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="size-4 mr-2" />
                        Delete Job
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Repair Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this repair job? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
