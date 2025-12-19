import { Sidebar } from './Sidebar';
import { LogoutButton } from "@/components/auth/LogoutButton";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">

      <Sidebar />

      <main className="pl-64">

        <div className="p-8">

          {children}
        </div>
      </main>
    </div>
  );
}
