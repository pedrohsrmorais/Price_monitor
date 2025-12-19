import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';

type JobStatus = 'queued' | 'running' | 'done' | 'failed';

interface ExecutionStatusBadgeProps {
  status: JobStatus;
}

const statusConfig: Record<JobStatus, {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'processing';
  icon: React.ComponentType<{ className?: string }>;
}> = {
  queued: {
    label: 'Pendente',
    variant: 'warning',
    icon: Clock,
  },
  running: {
    label: 'Em execução',
    variant: 'processing',
    icon: Loader2,
  },
  done: {
    label: 'Concluído',
    variant: 'success',
    icon: CheckCircle2,
  },
  failed: {
    label: 'Falhou',
    variant: 'destructive',
    icon: XCircle,
  },
};

export function ExecutionStatusBadge({ status }: ExecutionStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1.5">
      <Icon className={`h-3 w-3 ${status === 'running' ? 'animate-spin' : ''}`} />
      {config.label}
    </Badge>
  );
}
