import type { Notification } from "@/components/sidebar/notification-config";
type NotificationBellProps = {
    /** Notification list from your API — defaults to empty when omitted */
    notifications?: Notification[];
    className?: string;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onNotificationClick?: (notification: Notification) => void;
    onMarkAllRead?: () => void;
};
declare function NotificationBellItem({ notification, onClick, }: {
    notification: Notification;
    onClick?: (notification: Notification) => void;
}): import("react/jsx-runtime").JSX.Element;
declare function NotificationBell({ notifications, className, open, defaultOpen, onOpenChange, onNotificationClick, onMarkAllRead, }: NotificationBellProps): import("react/jsx-runtime").JSX.Element;
export { NotificationBell, NotificationBellItem, };
export type { Notification, NotificationBellProps };
