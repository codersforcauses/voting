import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { Route } from "./+types/admin";
import { AppSidebar } from "@/components/admin/app-sidebar";
import Users from "@/components/admin/users";
import { useLocation } from "react-router";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Nominations from "@/components/admin/nominations";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin Page" },
    { name: "description", content: "ADMIN ADMIN ADMIN" },
  ];
}

export default function Admin() {
  const { hash } = useLocation();
  let currentPage: string;
  let CurrentView = () => <> </>;
  if (!hash) {
    currentPage = "Overview";
    CurrentView = () => <> </>;
  } else {
    currentPage = hash.split("#")[1];
    CurrentView = Users;
    if (currentPage.includes("nomination") || currentPage.includes("result")) {
      currentPage = currentPage.split("=").join(" - ");
      CurrentView = currentPage.includes("nomination")
        ? Nominations
        : () => <> </>;
    }
  }
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 cursor-pointer" />
            <Separator orientation="vertical" className="h-4! mr-2" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  Admin Dashboard
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="capitalize">
                    {currentPage}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <main className="w-full h-full p-2">
          <CurrentView />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
