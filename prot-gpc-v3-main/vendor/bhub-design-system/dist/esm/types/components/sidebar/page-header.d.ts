import * as React from "react";
type PageHeaderProps = React.ComponentProps<"header"> & {
    /** Render the built-in SidebarTrigger on the left. @default true */
    showTrigger?: boolean;
    /** Right-aligned actions area (e.g. CurrentDateTime, NotificationBell). */
    actions?: React.ReactNode;
};
declare function PageHeader({ showTrigger, actions, className, children, ...props }: PageHeaderProps): import("react/jsx-runtime").JSX.Element;
export { PageHeader };
export type { PageHeaderProps };
