import { RepairJob } from '@/types';
import { STATUS_OPTIONS } from '@/constants/config';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList, Clock, CheckCircle, Package } from 'lucide-react';

interface StatsCardsProps {
  jobs: RepairJob[];
}

export const StatsCards = ({ jobs }: StatsCardsProps) => {
  const stats = [
    {
      label: 'Total Jobs',
      value: jobs.length,
      icon: ClipboardList,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
    },
    {
      label: 'Pending',
      value: jobs.filter(j => j.status === 'pending').length,
      icon: Clock,
      color: 'bg-yellow-500',
      lightColor: 'bg-yellow-50',
    },
    {
      label: 'In Progress',
      value: jobs.filter(j => j.status === 'in-progress').length,
      icon: Clock,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
    },
    {
      label: 'Completed',
      value: jobs.filter(j => j.status === 'completed').length,
      icon: CheckCircle,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
    },
    {
      label: 'Delivered',
      value: jobs.filter(j => j.status === 'delivered').length,
      icon: Package,
      color: 'bg-slate-500',
      lightColor: 'bg-slate-50',
    },
  ];

  const totalRevenue = jobs.reduce((sum, job) => sum + job.amountCharged, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map(stat => (
        <Card key={stat.label} className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.lightColor}`}>
                <stat.icon className={`size-5 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <Card className="border-0 shadow-sm bg-emerald-50">
        <CardContent className="p-4">
          <div>
            <p className="text-2xl font-bold text-emerald-600">
              {totalRevenue.toLocaleString('en-SA')}
            </p>
            <p className="text-xs text-emerald-700">Total Revenue (ر.س)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
