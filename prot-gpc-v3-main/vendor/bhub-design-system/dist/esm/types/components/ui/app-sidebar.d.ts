import * as React from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { type Workspace } from "@/components/sidebar/workspace-switcher";
import { type UpdateCardProps } from "@/components/sidebar/update-card";
import type { NavGroup } from "@/components/sidebar/nav-config";
declare const defaultUser: {
    name: string;
    email: string;
    scope: string;
};
declare const defaultNavGroups: NavGroup[];
declare const defaultUpdateCard: UpdateCardProps;
type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
    navGroups?: NavGroup[];
    /**
     * Update/announcement card shown in the footer. Acts as a feature-flag:
     * when omitted (or `enabled: false`), the card is not rendered.
     */
    updateCard?: UpdateCardProps;
    disabledTooltip?: string;
    workspaces?: Workspace[];
    user?: typeof defaultUser;
};
declare function AppSidebar({ navGroups, updateCard, disabledTooltip, workspaces, user, ...props }: AppSidebarProps): import("react/jsx-runtime").JSX.Element;
export { AppSidebar, defaultNavGroups, defaultUpdateCard };
export type { AppSidebarProps };
