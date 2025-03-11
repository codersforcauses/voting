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

const data = {
  items: [
    {
      title: "Home",
      url: "#",
      icon: "home",
    },
    {
      title: "Users",
      url: "#",
      icon: "group",
    },
  ],
  expandable: [
    {
      title: "Nominations",
      url: "#",
      icon: "ballot",
      items: [
        {
          title: "President",
          url: "#",
        },
        {
          title: "Vice President",
          url: "#",
        },
        {
          title: "Secretary",
          url: "#",
        },
        {
          title: "Treasurer",
          url: "#",
        },
        {
          title: "Technical Lead",
          url: "#",
        },
        {
          title: "Marketing Officer",
          url: "#",
        },
        {
          title: "Fresher Representative",
          url: "#",
        },
        {
          title: "OCM",
          url: "#",
        },
      ],
    },
    {
      title: "Results",
      url: "#",
      icon: "how_to_reg",
      items: [
        {
          title: "President",
          url: "#",
        },
        {
          title: "Vice President",
          url: "#",
        },
        {
          title: "Secretary",
          url: "#",
        },
        {
          title: "Treasurer",
          url: "#",
        },
        {
          title: "Technical Lead",
          url: "#",
        },
        {
          title: "Marketing Officer",
          url: "#",
        },
        {
          title: "Fresher Representative",
          url: "#",
        },
        {
          title: "OCM",
          url: "#",
        },
      ],
    },
  ],
};

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="flex-row items-center">
        <div className="grid font-mono font-medium text-white bg-black size-10 place-items-center dark:text-black aspect-square dark:bg-white">
          cfc
        </div>
        <span className="ml-1 font-medium">Coders for Causes</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-1">
            {data.items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <span className="material-symbols-sharp">{item.icon}</span>
                    <span>{item.title}</span>
                  </a>
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
