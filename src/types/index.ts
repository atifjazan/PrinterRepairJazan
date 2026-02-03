export type DeviceType = 'PC' | 'Laptop' | 'Printer';

export type RepairStatus = 'pending' | 'in-progress' | 'completed' | 'delivered';

export interface RepairJob {
  id: string;
  customerName: string;
  mobile: string;
  deviceType: DeviceType;
  brandModel: string;
  serialNumber: string;
  problemDetails: string;
  repairDate: string;
  amountCharged: number;
  notes: string;
  status: RepairStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ShopInfo {
  name: string;
  address: string;
  mobile: string;
}
