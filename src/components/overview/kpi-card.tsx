import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

type KpiCardProps = {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  isPercentage?: boolean;
};

export default function KpiCard({ title, value, icon: Icon, color, isPercentage = false }: KpiCardProps) {
  const formattedValue = isPercentage
    ? `${value.toFixed(1)}%`
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-muted-foreground ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
      </CardContent>
    </Card>
  );
}
