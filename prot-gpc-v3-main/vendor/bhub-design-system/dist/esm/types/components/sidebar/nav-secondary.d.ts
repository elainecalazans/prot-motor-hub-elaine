import type { LucideIcon } from "lucide-react";
type NavSecondaryItem = {
    title: string;
    icon: LucideIcon;
    href: string;
};
type NavSecondaryProps = {
    items: NavSecondaryItem[];
};
declare function NavSecondary({ items }: NavSecondaryProps): import("react/jsx-runtime").JSX.Element;
export { NavSecondary };
export type { NavSecondaryItem, NavSecondaryProps };
