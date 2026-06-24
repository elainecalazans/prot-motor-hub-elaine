type NotificationDotProps = {
    /** Renders the unread dot. When false, keeps layout spacing. */
    show?: boolean;
    /** Adds the pulsing ring animation for active indicators. */
    pulse?: boolean;
    className?: string;
};
declare function NotificationDot({ show, pulse, className, }: NotificationDotProps): import("react/jsx-runtime").JSX.Element;
export { NotificationDot };
export type { NotificationDotProps };
