import { type LucideIcon } from "lucide-react";
type UpdateCardProps = {
    /** Controls visibility. When `false`, the card is not rendered (feature-flag). Defaults to `true`. */
    enabled?: boolean;
    /** Small uppercase eyebrow text. */
    label?: string;
    title: string;
    description: string;
    href: string;
    /** Call-to-action text for the link. */
    cta?: string;
    /** Icon shown in the top-right corner. */
    icon?: LucideIcon;
    /** When provided, renders a dismiss button that triggers this callback. */
    onDismiss?: () => void;
};
declare function UpdateCard({ enabled, label, title, description, href, cta, icon: Icon, onDismiss, }: UpdateCardProps): import("react/jsx-runtime").JSX.Element | null;
export { UpdateCard };
export type { UpdateCardProps };
