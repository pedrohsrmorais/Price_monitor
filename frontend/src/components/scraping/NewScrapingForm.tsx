import { useEffect, useState } from "react";
import { Search, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface Marketplace {
  id: number;
  name: string;
  scraper_key: string;
}

interface SelectedMarketplace {
  scraper_key: string;
  max_items: number;
}

interface NewScrapingFormProps {
  onSubmit: (
    searchTerm: string,
    marketplaces: SelectedMarketplace[]
  ) => Promise<void>;
}

export function NewScrapingForm({ onSubmit }: NewScrapingFormProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMarketplaces, setIsLoadingMarketplaces] = useState(true);
  const { toast } = useToast();

  // 🔄 Carrega marketplaces do backend
  useEffect(() => {
    async function loadMarketplaces() {
      try {
        const data = await api.getMarketplaces();
        setMarketplaces(data); // ✅ SEM FILTRO AQUI
      } catch (err: any) {
        toast({
          title: "Erro ao carregar marketplaces",
          description: err.message || "Erro inesperado",
          variant: "destructive",
        });
      } finally {
        setIsLoadingMarketplaces(false);
      }
    }

    loadMarketplaces();
  }, []);

  function toggleMarketplace(key: string) {
    setSelected((prev) => {
      if (prev[key] !== undefined) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }

      return { ...prev, [key]: 10 }; // default = 10
    });
  }

  function updateMaxItems(key: string, value: number) {
    setSelected((prev) => ({
      ...prev,
      [key]: Math.min(Math.max(value, 1), 10),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const selectedMarketplaces: SelectedMarketplace[] = Object.entries(
      selected
    ).map(([scraper_key, max_items]) => ({
      scraper_key,
      max_items,
    }));

    if (!searchTerm.trim() || selectedMarketplaces.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description:
          "Informe o termo de busca e selecione ao menos um marketplace.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await onSubmit(searchTerm.trim(), selectedMarketplaces);
      setSearchTerm("");
      setSelected({});
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 🔎 Termo de busca */}
      <div className="space-y-2">
        <Label htmlFor="searchTerm">Termo de Busca</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="searchTerm"
            placeholder="Ex: iPhone 15, Notebook Gamer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* 🏪 Marketplaces */}
      <div className="space-y-2">
        <Label>Sites de Origem</Label>

        {isLoadingMarketplaces ? (
          <div className="text-sm text-muted-foreground">
            Carregando marketplaces...
          </div>
        ) : marketplaces.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Nenhum marketplace disponível.
          </div>
        ) : (
          <div className="space-y-3">
            {marketplaces.map((mp) => {
              const isChecked = selected[mp.scraper_key] !== undefined;

              return (
                <div
                  key={mp.id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-3"
                >
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() =>
                        toggleMarketplace(mp.scraper_key)
                      }
                      disabled={isLoading}
                    />
                    <span className="font-medium">{mp.name}</span>
                  </label>

                  {/* Quantidade */}
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={isChecked ? selected[mp.scraper_key] : ""}
                    disabled={!isChecked || isLoading}
                    onChange={(e) =>
                      updateMaxItems(
                        mp.scraper_key,
                        Number(e.target.value)
                      )
                    }
                    className="w-20 text-center"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            Iniciando coleta...
          </>
        ) : (
          <>
            <Zap />
            Iniciar Coleta
          </>
        )}
      </Button>
    </form>
  );
}
