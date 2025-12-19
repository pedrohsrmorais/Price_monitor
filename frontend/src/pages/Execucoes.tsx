import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';

import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { ExecutionsList } from '@/components/scraping/ExecutionsList';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export type Job = {
  id: number;
  search_term: string;
  status: 'queued' | 'running' | 'done' | 'failed';
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  marketplace: string;
  products_count: number;
};

export default function Execucoes() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [executions, setExecutions] = useState<Job[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function loadExecutions() {
    try {
      const data: Job[] = await api.getJobs();
      setExecutions(data);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar execuções',
        variant: 'destructive',
      });
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    await loadExecutions();
    setIsRefreshing(false);

    toast({
      title: 'Atualizado',
      description: 'Lista de execuções atualizada com sucesso.',
    });
  }

  useEffect(() => {
    loadExecutions();
    const interval = setInterval(loadExecutions, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <MainLayout>
      <PageHeader
        title="Execuções"
        description="Acompanhe todas as coletas de dados realizadas"
      >
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </PageHeader>

      <ExecutionsList
        executions={executions}
        onViewProducts={(id) => navigate(`/produtos?execution=${id}`)}
      />
    </MainLayout>
  );
}
