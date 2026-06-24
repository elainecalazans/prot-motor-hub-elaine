/**
 * NotificationBell data contract.
 *
 * In production, map your API payload to `Notification` and pass the array
 * via the `notifications` prop on `<NotificationBell />`.
 */
type Notification = {
    /** Stable unique id from the backend */
    id: string;
    title: string;
    description?: string;
    /** Relative or formatted timestamp label (e.g. "2 min", "Ontem") */
    time: string;
    read?: boolean;
    /** Optional deep-link when the user clicks the notification */
    href?: string;
};
/**
 * Mock data for Storybook and local development.
 * Do not use in production — replace with real notifications from your API.
 */
declare const mockNotifications: Notification[];
export type { Notification };
export { mockNotifications };
