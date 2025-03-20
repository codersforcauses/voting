import {
  Sidebar,
  SidebarContent,
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
];

export function AppSidebar({ positions }: { positions: Position[] }) {
  const { hash } = useLocation();

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
          [
            {
              title: "Overview",
              url: "#result=all",
            },
          ].concat(
            positions.map(({ title, id }) => ({
              title,
              url: `#result=${id}?title=${encodeURI(title)}`,
            }))
          ) ?? [],
      },
    ],
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex-row items-center">
        <Logo />
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
    </Sidebar>
  );
}
