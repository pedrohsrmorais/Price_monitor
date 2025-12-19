import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { NewScrapingForm } from "@/components/scraping/NewScrapingForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface SelectedMarketplace {
  scraper_key: string;
  max_items: number;
}

export default function NovaColeta() {
  const navigate = useNavigate();
  const { toast } = useToast();

  async function handleSubmit(
    searchTerm: string,
    marketplaces: SelectedMarketplace[]
  ) {
    try {
      await api.startScraping(searchTerm, marketplaces);

      toast({
        title: "Coleta iniciada",
        description: `Scraping iniciado para "${searchTerm}"`,
      });

      navigate("/execucoes");
    } catch (error: any) {
      toast({
        title: "Erro ao iniciar coleta",
        description: error.message || "Erro inesperado",
        variant: "destructive",
      });
    }
  }

  return (
    <MainLayout>
      <PageHeader
        title="Nova Coleta"
        description="Inicie uma nova coleta de dados de produtos"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 glass-card">
          <CardHeader>
            <CardTitle>Configurar Coleta</CardTitle>
            <CardDescription>
              Defina o termo de busca e selecione os marketplaces
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewScrapingForm onSubmit={handleSubmit} />
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-warning" />
              Dicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-sm">Termos específicos</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Use termos específicos como "iPhone 15 Pro 256GB" para
                resultados mais precisos.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm">
                Comparação de preços
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Execute a mesma busca em diferentes sites para comparar
                preços.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Acompanhamento</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Acompanhe o status da coleta na página de Execuções.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
