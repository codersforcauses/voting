import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { Route } from "./+types/admin";
import { AppSidebar } from "@/components/app-sidebar";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin Page" },
    { name: "description", content: "ADMIN ADMIN ADMIN" },
  ];
}

export default function Admin() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-col w-full">
        <header className="flex items-center w-full gap-2 p-2 h-14">
          <SidebarTrigger />
          <h1>Admin Dashboard</h1>
        </header>
        <main className="w-full h-full p-2">hello</main>
      </div>
    </SidebarProvider>
  );
}
