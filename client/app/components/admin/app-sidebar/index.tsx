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

const data = {
  items: [
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
  ],
  expandable: [
    {
      title: "Nominations",
      icon: "ballot",
      items: [
        {
          title: "President",
          url: "#nomination=president",
        },
        {
          title: "Vice President",
          url: "#nomination=vp",
        },
        {
          title: "Secretary",
          url: "#nomination=secretary",
        },
        {
          title: "Treasurer",
          url: "#nomination=treasurer",
        },
        {
          title: "Technical Lead",
          url: "#nomination=tech-lead",
        },
        {
          title: "Marketing Officer",
          url: "#nomination=marketing",
        },
        {
          title: "Fresher Representative",
          url: "#nomination=fresher-rep",
        },
        {
          title: "OCM",
          url: "#nomination=ocm",
        },
      ],
    },
    {
      title: "Results",
      icon: "how_to_reg",
      items: [
        {
          title: "Overview",
          url: "#result=all",
        },
        {
          title: "President",
          url: "#result=president",
        },
        {
          title: "Vice President",
          url: "#result=vp",
        },
        {
          title: "Secretary",
          url: "#result=secretary",
        },
        {
          title: "Treasurer",
          url: "#result=treasurer",
        },
        {
          title: "Technical Lead",
          url: "#result=tech-lead",
        },
        {
          title: "Marketing Officer",
          url: "#result=marketing",
        },
        {
          title: "Fresher Representative",
          url: "#result=fresher-rep",
        },
        {
          title: "OCM",
          url: "#result=ocm",
        },
      ],
    },
  ],
};

export function AppSidebar() {
  const { hash } = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="flex-row items-center">
        <Logo></Logo>
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
            <NavExpanded items={data.expandable} />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
