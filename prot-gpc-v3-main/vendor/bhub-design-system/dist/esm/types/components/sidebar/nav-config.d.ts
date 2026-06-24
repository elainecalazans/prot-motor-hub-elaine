import type { LucideIcon } from "lucide-react";
type NavItem = {
    title: string;
    icon: LucideIcon;
    href: string;
    badge?: string | number;
    isActive?: boolean;
    disabled?: boolean;
    hasNotification?: boolean;
    notificationTooltip?: string;
    items?: NavItem[];
};
type NavGroup = {
    label?: string;
    items: NavItem[];
};
export type { NavItem, NavGroup };
