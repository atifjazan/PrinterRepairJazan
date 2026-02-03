import { useState } from 'react';
import { RepairJob, DeviceType } from '@/types';
import { DEVICE_TYPES, CURRENCY_SYMBOL } from '@/constants/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, RotateCcw } from 'lucide-react';

interface RepairFormProps {
  onSubmit: (job: Omit<RepairJob, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Partial<RepairJob>;
  isEditing?: boolean;
}

const getDefaultFormData = (): Omit<RepairJob, 'id' | 'createdAt' | 'updatedAt'> => ({
  customerName: '',
  mobile: '',
  deviceType: 'PC',
  brandModel: '',
  serialNumber: '',
  problemDetails: '',
  repairDate: new Date().toISOString().split('T')[0],
  amountCharged: 0,
  notes: '',
  status: 'pending',
});

export const RepairForm = ({ onSubmit, initialData, isEditing = false }: RepairFormProps) => {
  const [formData, setFormData] = useState<Omit<RepairJob, 'id' | 'createdAt' | 'updatedAt'>>(
    initialData ? { ...getDefaultFormData(), ...initialData } : getDefaultFormData()
  );

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    if (!isEditing) {
      setFormData(getDefaultFormData());
    }
  };

  const handleReset = () => {
    setFormData(getDefaultFormData());
  };

  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Plus className="size-5 text-primary" />
          {isEditing ? 'Edit Repair Job' : 'New Repair Job'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Customer Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={e => handleChange('customerName', e.target.value)}
                placeholder="Enter customer name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input
                id="mobile"
                value={formData.mobile}
                onChange={e => handleChange('mobile', e.target.value)}
                placeholder="05XXXXXXXX"
                required
              />
            </div>
          </div>

          {/* Device Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deviceType">Device Type *</Label>
              <Select
                value={formData.deviceType}
                onValueChange={(value: DeviceType) => handleChange('deviceType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEVICE_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandModel">Brand & Model *</Label>
              <Input
                id="brandModel"
                value={formData.brandModel}
                onChange={e => handleChange('brandModel', e.target.value)}
                placeholder="e.g., HP Pavilion 15"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={e => handleChange('serialNumber', e.target.value)}
                placeholder="Device serial number"
              />
            </div>
          </div>

          {/* Problem Details */}
          <div className="space-y-2">
            <Label htmlFor="problemDetails">Problem Details *</Label>
            <Textarea
              id="problemDetails"
              value={formData.problemDetails}
              onChange={e => handleChange('problemDetails', e.target.value)}
              placeholder="Describe the issue in detail..."
              rows={3}
              required
            />
          </div>

          {/* Date and Amount Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="repairDate">Repair Date *</Label>
              <Input
                id="repairDate"
                type="date"
                value={formData.repairDate}
                onChange={e => handleChange('repairDate', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amountCharged">Amount Charged ({CURRENCY_SYMBOL})</Label>
              <Input
                id="amountCharged"
                type="number"
                min="0"
                step="0.01"
                value={formData.amountCharged || ''}
                onChange={e => handleChange('amountCharged', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={e => handleChange('notes', e.target.value)}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">
              <Plus className="size-4 mr-2" />
              {isEditing ? 'Update Job' : 'Add Job'}
            </Button>
            {!isEditing && (
              <Button type="button" variant="outline" onClick={handleReset}>
                <RotateCcw className="size-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
