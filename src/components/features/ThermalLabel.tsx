import { RepairJob } from '@/types';
import { SHOP_INFO, CURRENCY_SYMBOL } from '@/constants/config';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, Tag } from 'lucide-react';
import { useRef } from 'react';

interface ThermalLabelProps {
  job: RepairJob;
  isOpen: boolean;
  onClose: () => void;
}

export const ThermalLabel = ({ job, isOpen, onClose }: ThermalLabelProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const handlePrintReceipt = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Receipt</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Courier New', monospace;
              width: 80mm;
              padding: 4mm;
              font-size: 12px;
              line-height: 1.4;
            }
            .shop-name {
              font-size: 14px;
              font-weight: bold;
              text-align: center;
              margin-bottom: 2mm;
            }
            .shop-info {
              font-size: 10px;
              text-align: center;
              margin-bottom: 3mm;
              border-bottom: 1px dashed #000;
              padding-bottom: 3mm;
            }
            .field {
              margin-bottom: 2mm;
            }
            .field-label {
              font-weight: bold;
              font-size: 10px;
            }
            .field-value {
              font-size: 12px;
            }
            .price {
              font-size: 16px;
              font-weight: bold;
              text-align: center;
              margin-top: 3mm;
              padding-top: 3mm;
              border-top: 1px dashed #000;
            }
            .footer {
              font-size: 9px;
              text-align: center;
              margin-top: 3mm;
              padding-top: 2mm;
              border-top: 1px dashed #000;
            }
            .job-id {
              font-size: 10px;
              text-align: right;
              margin-bottom: 2mm;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handlePrintLabel = () => {
    const printContent = labelRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Label</title>
          <style>
            @page {
              size: 50mm 30mm;
              margin: 0;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Arial', sans-serif;
              width: 50mm;
              height: 30mm;
              padding: 2mm;
              font-size: 8px;
              line-height: 1.2;
            }
            .label-header {
              font-size: 7px;
              font-weight: bold;
              text-align: center;
              border-bottom: 1px solid #000;
              padding-bottom: 1mm;
              margin-bottom: 1mm;
            }
            .label-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 0.5mm;
            }
            .label-key {
              font-weight: bold;
              font-size: 7px;
            }
            .label-value {
              font-size: 8px;
              text-align: right;
              max-width: 30mm;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .label-fault {
              font-size: 7px;
              margin-top: 1mm;
              border-top: 1px dashed #000;
              padding-top: 1mm;
              line-height: 1.1;
              max-height: 8mm;
              overflow: hidden;
            }
            .label-price {
              font-size: 10px;
              font-weight: bold;
              text-align: center;
              margin-top: 1mm;
              padding-top: 1mm;
              border-top: 1px solid #000;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="size-5" />
            Print Options
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="receipt" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="receipt" className="flex items-center gap-2">
              <Printer className="size-4" />
              Receipt (80mm)
            </TabsTrigger>
            <TabsTrigger value="label" className="flex items-center gap-2">
              <Tag className="size-4" />
              Label (50mm)
            </TabsTrigger>
          </TabsList>

          {/* Receipt Tab - 80mm Thermal */}
          <TabsContent value="receipt" className="mt-4">
            <div className="bg-white border-2 border-dashed border-slate-300 p-4 rounded-lg">
              <div ref={receiptRef} className="font-mono text-sm space-y-2">
                <div className="shop-name">{SHOP_INFO.name}</div>
                <div className="shop-info">
                  {SHOP_INFO.address}<br />
                  Tel: {SHOP_INFO.mobile}
                </div>
                
                <div className="job-id">Job #: {job.id}</div>
                
                <div className="field">
                  <div className="field-label">CUSTOMER:</div>
                  <div className="field-value">{job.customerName}</div>
                </div>
                
                <div className="field">
                  <div className="field-label">MOBILE:</div>
                  <div className="field-value">{job.mobile}</div>
                </div>
                
                <div className="field">
                  <div className="field-label">MODEL:</div>
                  <div className="field-value">{job.brandModel}</div>
                </div>
                
                <div className="field">
                  <div className="field-label">FAULT:</div>
                  <div className="field-value">{job.problemDetails}</div>
                </div>
                
                <div className="price">
                  {job.amountCharged} {CURRENCY_SYMBOL}
                </div>
                
                <div className="footer">
                  Date: {job.repairDate}<br />
                  Thank you for your business!
                </div>
              </div>
            </div>
            <Button onClick={handlePrintReceipt} className="w-full mt-4">
              <Printer className="size-4 mr-2" />
              Print Receipt
            </Button>
          </TabsContent>

          {/* Label Tab - 50mm x 30mm Sticker */}
          <TabsContent value="label" className="mt-4">
            <div className="flex justify-center">
              <div className="bg-white border-2 border-dashed border-slate-300 p-3 rounded-lg" style={{ width: '200px' }}>
                <div ref={labelRef} className="text-xs space-y-1">
                  <div className="label-header text-center font-bold text-[10px] border-b border-slate-400 pb-1">
                    {SHOP_INFO.name}
                  </div>
                  
                  <div className="label-row flex justify-between">
                    <span className="label-key font-semibold">Name:</span>
                    <span className="label-value truncate max-w-[120px]">{job.customerName}</span>
                  </div>
                  
                  <div className="label-row flex justify-between">
                    <span className="label-key font-semibold">Mobile:</span>
                    <span className="label-value">{job.mobile}</span>
                  </div>
                  
                  <div className="label-row flex justify-between">
                    <span className="label-key font-semibold">Model:</span>
                    <span className="label-value truncate max-w-[120px]">{job.brandModel}</span>
                  </div>
                  
                  <div className="label-fault border-t border-dashed border-slate-400 pt-1 mt-1">
                    <span className="font-semibold">Fault:</span> {job.problemDetails.substring(0, 50)}{job.problemDetails.length > 50 ? '...' : ''}
                  </div>
                  
                  <div className="label-price text-center font-bold text-sm border-t border-slate-400 pt-1 mt-1">
                    {job.amountCharged} {CURRENCY_SYMBOL}
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              50mm × 30mm label for device sticker
            </p>
            <Button onClick={handlePrintLabel} className="w-full mt-3">
              <Tag className="size-4 mr-2" />
              Print Label Sticker
            </Button>
          </TabsContent>
        </Tabs>

        <Button variant="outline" onClick={onClose} className="mt-2">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};
