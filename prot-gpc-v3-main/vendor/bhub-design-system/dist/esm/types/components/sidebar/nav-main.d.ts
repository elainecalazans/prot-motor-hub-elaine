import type { NavGroup } from "@/components/sidebar/nav-config";
type NavMainProps = {
    navGroups: NavGroup[];
    disabledTooltip?: string;
};
declare function NavMain({ navGroups, disabledTooltip }: NavMainProps): import("react/jsx-runtime").JSX.Element;
export { NavMain };
