import * as React from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { Route } from "./+types/admin";
import { AppSidebar } from "@/components/admin/app-sidebar";
import Users from "@/components/admin/users";
import { redirect, useLocation } from "react-router";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Nominations from "@/components/admin/nominations";
import OverView from "@/components/admin/overview";
import { useToken } from "@/lib/user";
import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "@/lib/utils";
import type { Position } from "@/lib/types";
import Auth from "@/components/auth";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin Page" },
    { name: "description", content: "ADMIN ADMIN ADMIN" },
  ];
}

export default function Admin() {
  const { hash } = useLocation();
  const [token, setToken] = React.useState(useToken());
  const { data: adminCheck } = useQuery({
    enabled: !!token,
    queryKey: ["admin"],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/auth`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },
  });
  const { data: positions } = useQuery<Position[]>({
    queryKey: ["positions"],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/position`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },
    staleTime: 0,
  });

  const logout = React.useCallback(() => {
    setToken("");
    window.localStorage.removeItem("token");
  }, []);

  if (!token) return <Auth setToken={setToken} />;
  if (!adminCheck) redirect("/");

  let currentPage = "";
  let CurrentView = () => <> </>;

  if (!hash) {
    currentPage = "Overview";
    CurrentView = OverView;
  } else if (hash.includes("users")) {
    currentPage = "Users";
    CurrentView = Users;
  } else {
    const title = decodeURI(hash.split("?")[1].split("=")[1]);

    if (hash.includes("nomination")) {
      currentPage = `Nomination - ${title}`;
      CurrentView = Nominations;
    } else if (hash.includes("result")) {
      currentPage = `Result - ${title}`;
      CurrentView = () => <> </>;
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar logout={logout} positions={positions ?? []} />
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
