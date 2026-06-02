import { useState, useRef } from 'react';
import { RepairJob } from '@/types';
import { parseCSV, previewImport, downloadCSV } from '@/lib/storage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Upload,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Download,
  X,
} from 'lucide-react';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (importedJobs: Partial<RepairJob>[]) => { added: number; updated: number; unchanged: number };
}

interface PreviewState {
  toAdd: Partial<RepairJob>[];
  toUpdate: Array<{ existing: RepairJob; incoming: Partial<RepairJob>; changedFields: string[] }>;
  unchanged: number;
  parsedRecords: Partial<RepairJob>[];
  fileName: string;
}

const SAMPLE_CSV = `customerName,mobile,deviceType,brandModel,serialNumber,problemDetails,repairDate,amountCharged,notes,status
Ahmed Al-Ghamdi,0551234567,Laptop,HP Pavilion 15,HP2024XY123,Screen flickering,2024-01-15,450,Replaced screen,completed
Mohammed Hassan,0559876543,Printer,Canon PIXMA G3010,CAN2023AB456,Paper jam,2024-01-16,200,Cleaned rollers,delivered`;

export const ImportDialog = ({ isOpen, onClose, onImport }: ImportDialogProps) => {
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      try {
        const records = parseCSV(text);
        if (records.length === 0) {
          setError('No valid records found. Make sure your CSV has proper headers and at least one row of data.');
          return;
        }
        const previewData = previewImport(records);
        setPreview({
          ...previewData,
          parsedRecords: records,
          fileName: file.name,
        });
      } catch (err) {
        setError('Failed to parse CSV file. Please check the format.');
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!preview) return;
    const result = onImport(preview.parsedRecords);
    toast({
      title: 'Import Complete',
      description: `${result.added} added, ${result.updated} updated, ${result.unchanged} unchanged.`,
    });
    handleClose();
  };

  const handleClose = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const downloadTemplate = () => {
    downloadCSV(SAMPLE_CSV, 'customer-import-template.csv');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="size-5 text-primary" />
            Import Customer Records
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file. Existing records will be updated if any field changed; new records will be added.
          </DialogDescription>
        </DialogHeader>

        {!preview ? (
          // Upload Stage
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <FileSpreadsheet className="size-12 mx-auto text-slate-400 mb-3" />
              <h3 className="font-medium text-slate-700 mb-1">Select CSV File</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload">
                <Button asChild className="cursor-pointer">
                  <span>
                    <Upload className="size-4 mr-2" />
                    Choose CSV File
                  </span>
                </Button>
              </label>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Alert>
              <AlertCircle className="size-4" />
              <AlertDescription className="space-y-2">
                <div>
                  <strong>Required columns:</strong> customerName, mobile
                </div>
                <div>
                  <strong>Optional columns:</strong> deviceType, brandModel, serialNumber, problemDetails, repairDate, amountCharged, notes, status
                </div>
                <div className="text-xs">
                  <strong>Duplicate detection:</strong> Records are matched by ID, then by mobile + serial number, then by mobile + model + date.
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex justify-center">
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="size-4 mr-2" />
                Download Sample Template
              </Button>
            </div>
          </div>
        ) : (
          // Preview Stage
          <div className="flex-1 overflow-hidden flex flex-col min-h-0 space-y-3 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="size-4 text-primary" />
                <span className="text-sm font-medium">{preview.fileName}</span>
                <Badge variant="outline" className="text-xs">
                  {preview.parsedRecords.length} records parsed
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                <X className="size-3.5 mr-1" />
                Choose Different File
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                <div className="flex items-center gap-2 text-emerald-700 text-xs font-medium">
                  <Plus className="size-3.5" />
                  New Records
                </div>
                <div className="text-2xl font-bold text-emerald-900 mt-1">
                  {preview.toAdd.length}
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-700 text-xs font-medium">
                  <RefreshCw className="size-3.5" />
                  Will Update
                </div>
                <div className="text-2xl font-bold text-blue-900 mt-1">
                  {preview.toUpdate.length}
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-slate-700 text-xs font-medium">
                  <CheckCircle2 className="size-3.5" />
                  Unchanged
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-1">
                  {preview.unchanged}
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 border rounded-lg">
              <div className="p-3 space-y-3">
                {preview.toAdd.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 sticky top-0 bg-white py-1">
                      <Plus className="size-4 text-emerald-600" />
                      <h4 className="font-semibold text-sm text-emerald-700">
                        New Records ({preview.toAdd.length})
                      </h4>
                    </div>
                    <div className="space-y-1.5">
                      {preview.toAdd.slice(0, 10).map((record, idx) => (
                        <div
                          key={idx}
                          className="text-xs p-2 bg-emerald-50/50 border border-emerald-100 rounded flex items-center gap-3"
                        >
                          <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200 shrink-0">
                            NEW
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {record.customerName} • {record.mobile}
                            </div>
                            <div className="text-muted-foreground truncate">
                              {record.deviceType} {record.brandModel}
                              {record.amountCharged ? ` • ${record.amountCharged} ر.س` : ''}
                            </div>
                          </div>
                        </div>
                      ))}
                      {preview.toAdd.length > 10 && (
                        <div className="text-xs text-muted-foreground text-center py-1">
                          + {preview.toAdd.length - 10} more new records
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {preview.toUpdate.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 mt-3 sticky top-0 bg-white py-1">
                      <RefreshCw className="size-4 text-blue-600" />
                      <h4 className="font-semibold text-sm text-blue-700">
                        Records to Update ({preview.toUpdate.length})
                      </h4>
                    </div>
                    <div className="space-y-1.5">
                      {preview.toUpdate.slice(0, 10).map((item, idx) => (
                        <div
                          key={idx}
                          className="text-xs p-2 bg-blue-50/50 border border-blue-100 rounded"
                        >
                          <div className="flex items-center gap-3 mb-1">
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 shrink-0">
                              UPDATE
                            </Badge>
                            <div className="font-medium truncate">
                              {item.existing.customerName} • {item.existing.mobile}
                            </div>
                          </div>
                          <div className="text-muted-foreground pl-1">
                            <span className="font-medium">Changed:</span>{' '}
                            {item.changedFields.join(', ')}
                          </div>
                        </div>
                      ))}
                      {preview.toUpdate.length > 10 && (
                        <div className="text-xs text-muted-foreground text-center py-1">
                          + {preview.toUpdate.length - 10} more updates
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {preview.toAdd.length === 0 && preview.toUpdate.length === 0 && (
                  <div className="text-center py-6">
                    <CheckCircle2 className="size-10 mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      All records in this file already exist with no changes.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {preview && (preview.toAdd.length > 0 || preview.toUpdate.length > 0) && (
            <Button onClick={handleConfirmImport}>
              <Upload className="size-4 mr-2" />
              Apply {preview.toAdd.length + preview.toUpdate.length} Changes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
