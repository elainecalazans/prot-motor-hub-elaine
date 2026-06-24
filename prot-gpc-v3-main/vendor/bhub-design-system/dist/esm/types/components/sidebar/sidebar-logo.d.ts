import * as React from "react";
type SidebarLogoProps = {
    /** Full logo shown when sidebar is expanded */
    expandedLogo?: React.ReactNode;
    /** Icon-only logo shown when sidebar is collapsed */
    collapsedLogo?: React.ReactNode;
    /** Optional partner section rendered alongside BHub logo */
    partnerLogo?: React.ReactNode;
};
declare function BHubLogoFull(props: React.SVGProps<SVGSVGElement>): import("react/jsx-runtime").JSX.Element;
declare function BHubLogoIcon(props: React.SVGProps<SVGSVGElement>): import("react/jsx-runtime").JSX.Element;
declare function SidebarLogo({ expandedLogo, collapsedLogo, partnerLogo, }: SidebarLogoProps): import("react/jsx-runtime").JSX.Element;
export { SidebarLogo, BHubLogoFull, BHubLogoIcon };
export type { SidebarLogoProps };
