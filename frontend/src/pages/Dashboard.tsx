import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, History, Package, TrendingUp } from 'lucide-react';

import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ExecutionsList } from '@/components/scraping/ExecutionsList';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Job } from './Execucoes';

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    try {
      setLoading(true);
      const data: Job[] = await api.getJobs();
      setJobs(data);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados do dashboard',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  // 🔢 Stats calculadas a partir do BACKEND
  const totalExecutions = jobs.length;

  const completedToday = jobs.filter((job) => {
    if (job.status !== 'done') return false;

    const createdDate = new Date(job.created_at);
    const today = new Date();

    return (
      createdDate.getDate() === today.getDate() &&
      createdDate.getMonth() === today.getMonth() &&
      createdDate.getFullYear() === today.getFullYear()
    );
  }).length;

  const productsCollected = jobs.reduce(
    (acc, job) => acc + job.products_count,
    0
  );

  const activeCollections = jobs.filter(
    (job) => job.status === 'running' || job.status === 'queued'
  ).length;

  const recentExecutions = jobs.slice(0, 5);

  return (
    <MainLayout>
      <PageHeader
        title="Dashboard"
        description="Visão geral do serviço de scraping"
      >
        <Button onClick={() => navigate('/nova-coleta')}>
          <Play className="h-4 w-4" />
          Nova Coleta
        </Button>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Total de Execuções"
          value={totalExecutions}
          icon={History}
        />

        <StatsCard
          title="Concluídas Hoje"
          value={completedToday}
          icon={TrendingUp}
        />

        <StatsCard
          title="Produtos Coletados"
          value={productsCollected}
          icon={Package}
        />

        <StatsCard
          title="Coletas Ativas"
          value={activeCollections}
          icon={Play}
        />
      </div>

      {/* Recent Executions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Execuções Recentes</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/execucoes')}
          >
            Ver todas
          </Button>
        </div>

        <ExecutionsList
          executions={recentExecutions}
          onViewProducts={(id) =>
            navigate(`/produtos?execution=${id}`)
          }
        />
      </div>
    </MainLayout>
  );
}
