import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ExternalLink, Package } from 'lucide-react';

import { ExecutionStatusBadge } from './ExecutionStatusBadge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { Job } from '@/pages/Execucoes';

interface ExecutionsListProps {
  executions: Job[];
  onViewProducts?: (executionId: number) => void;
}

export function ExecutionsList({ executions, onViewProducts }: ExecutionsListProps) {
  if (executions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-medium">Nenhuma execução encontrada</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Inicie uma nova coleta para ver os resultados aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Termo de Busca</TableHead>
            <TableHead>Marketplace</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data de Criação</TableHead>
            <TableHead>Produtos</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {executions.map((execution) => (
            <TableRow key={execution.id}>
              <TableCell className="font-medium">
                {execution.search_term}
              </TableCell>

              <TableCell>
                {execution.marketplace}
              </TableCell>

              <TableCell>
                <ExecutionStatusBadge status={execution.status} />
              </TableCell>

              <TableCell className="text-muted-foreground">
                {format(
                  new Date(execution.created_at),
                  'dd MMM yyyy, HH:mm',
                  { locale: ptBR }
                )}
              </TableCell>

              <TableCell>
                <span className="font-medium text-primary">
                  {execution.products_count}
                </span>
              </TableCell>

              <TableCell className="text-right">
                {execution.status === 'done' && execution.products_count > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewProducts?.(execution.id)}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ver produtos
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
