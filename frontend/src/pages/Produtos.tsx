import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/services/api";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductsGrid } from "@/components/scraping/ProductsGrid";
import { Product } from "@/types/scraping";


export default function Produtos() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const executionId = searchParams.get("execution");

  useEffect(() => {
    setLoading(true);

    api.getProducts(
      executionId ? { execution: executionId } : undefined
    )
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [executionId]);

  return (
    <MainLayout>
      <PageHeader
        title="Produtos Coletados"
        description="Visualize todos os produtos coletados pelo serviço de scraping"
      />

      {loading ? (
        <p>Carregando produtos...</p>
      ) : (
        <ProductsGrid products={products} />
      )}
    </MainLayout>
  );
}
