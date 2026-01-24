import { Header } from "@/components/dashboard/Header";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
            <Header />

            <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto scrollbar-thin overflow-x-hidden">
                <div className="max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
