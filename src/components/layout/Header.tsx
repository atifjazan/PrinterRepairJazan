import { SHOP_INFO } from '@/constants/config';
import { Monitor, Phone, MapPin } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-slate-900 text-white no-print">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-12 bg-primary rounded-lg">
              <Monitor className="size-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{SHOP_INFO.name}</h1>
              <div className="flex items-center gap-4 text-slate-400 text-sm mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" />
                  {SHOP_INFO.address}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="size-3" />
                  {SHOP_INFO.mobile}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
