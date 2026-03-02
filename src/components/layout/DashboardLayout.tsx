import { Header } from "@/components/dashboard/Header";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="flex flex-col min-h-screen bg-background w-full">
            <Header />

            <main className="flex-1 w-full max-w-full overflow-x-hidden overflow-y-auto px-4 py-6 sm:p-6 lg:p-10">
                <div className="max-w-[1600px] mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
