import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavExpanded } from "./nav-expanded";
import { Link, useLocation } from "react-router";
import { Logo } from "../../ui/logo";
import type { Position } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

const items = [
  {
    title: "Overview",
    url: "#",
    hash: "",
    icon: "home",
  },
  {
    title: "Users",
    url: "#users",
    hash: "#users",
    icon: "group",
  },
  {
    title: "Seats",
    url: "#seats",
    hash: "#seats",
    icon: "local_activity",
  },
];

export function AppSidebar({
  logout,
  positions,
}: {
  logout: () => void;
  positions: Position[];
}) {
  const { hash } = useLocation();
  const { setTheme, theme } = useTheme();
  const isDarkMode = theme === "dark";

  const data = {
    items,
    expandable: [
      {
        title: "Nominations",
        icon: "ballot",
        items:
          positions.map(({ title, id }) => ({
            title,
            url: `#nomination=${id}?title=${encodeURI(title)}`,
          })) ?? [],
      },
      {
        title: "Results",
        icon: "how_to_reg",
        items:
          positions.map(({ title, id }) => ({
            title,
            url: `#result=${id}?title=${encodeURI(title)}`,
          }))
      },
    ],
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex-row items-center">
        <button onClick={() => setTheme(isDarkMode ? "light" : "dark")}>
          <Logo />
        </button>
        <span className="ml-1 font-medium">Coders for Causes</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-1">
            {data.items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={hash === item.hash}
                  className="[active]:bg-sidebar-accent"
                >
                  <Link to={item.url}>
                    <span className="material-symbols-sharp">{item.icon}</span>
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            {positions && <NavExpanded items={data.expandable} />}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button className="w-full" variant="secondary" onClick={logout}>
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
