import { ShopInfo } from '@/types';

export const SHOP_INFO: ShopInfo = {
  name: 'Printer And Computer Repair',
  address: 'Airport Road, Jazan',
  mobile: '0562426625',
};

export const CURRENCY_SYMBOL = 'ر.س';

export const DEVICE_TYPES = ['PC', 'Laptop', 'Printer'] as const;

export const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-gray-100 text-gray-800' },
] as const;
