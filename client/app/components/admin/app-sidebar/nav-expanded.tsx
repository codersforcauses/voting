import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useLocation } from "react-router";

export function NavExpanded({
  items,
}: {
  items: {
    title: string;
    icon?: string;
    items: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const { hash } = useLocation();
  return (
    <>
      {items.map((item) => (
        <Collapsible
          key={item.title}
          asChild
          defaultOpen
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip={item.title}>
                {item.icon && (
                  <span className="material-symbols-sharp">{item.icon}</span>
                )}
                <span>{item.title}</span>
                {item.items && (
                  <span className="material-symbols-sharp ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90">
                    chevron_right
                  </span>
                )}
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.items.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={hash === subItem.url}
                      className="[active]:bg-sidebar-accent"
                    >
                      <a href={subItem.url}>
                        <span>{subItem.title}</span>
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      ))}
    </>
  );
}
