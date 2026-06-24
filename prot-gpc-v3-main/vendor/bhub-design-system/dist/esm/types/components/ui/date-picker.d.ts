import * as React from "react";
import { type Locale } from "date-fns";
import type { DateRange } from "react-day-picker";
import { type FixedPortalPanelOptions } from "@/lib/use-fixed-portal-panel";
import { Calendar } from "@/components/ui/calendar";
type DatePickerPortalProps = FixedPortalPanelOptions;
interface DatePickerProps extends DatePickerPortalProps {
    value?: Date;
    onValueChange?: (date: Date | undefined) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    /** Format string for date-fns (default: "PPP") */
    dateFormat?: string;
    /**
     * Calendar header layout. Defaults to `"dropdown"`, which exposes month and
     * year dropdowns in the header so users can jump to distant months/years in
     * a few clicks (great for memorable dates like birthdate). Use `"label"` for
     * a static month/year caption with arrow-only navigation.
     */
    captionLayout?: React.ComponentProps<typeof Calendar>["captionLayout"];
    /** Earliest navigable/selectable month. Defaults to today − 100 years when the header uses dropdowns. */
    startMonth?: Date;
    /** Latest navigable/selectable month. Defaults to today + 10 years when the header uses dropdowns. */
    endMonth?: Date;
    /**
     * Dates to disable, as a react-day-picker Matcher — e.g.
     * `{ after: new Date() }` to forbid future dates on a birthdate field.
     */
    disabledDates?: React.ComponentProps<typeof Calendar>["disabled"];
    /**
     * date-fns locale for the trigger label and the month dropdown — e.g. `ptBR`
     * from `date-fns/locale`. Defaults to date-fns' built-in English locale.
     */
    locale?: Locale;
}
declare function DatePicker({ value, onValueChange, placeholder, disabled, className, dateFormat, captionLayout, startMonth, endMonth, disabledDates, locale, portalContainer, zIndex, }: Readonly<DatePickerProps>): import("react/jsx-runtime").JSX.Element;
interface DateRangePickerProps extends DatePickerPortalProps {
    value?: DateRange;
    onValueChange?: (range: DateRange | undefined) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    dateFormat?: string;
    /**
     * Calendar header layout. Defaults to `"dropdown"` (month/year dropdowns).
     * Use `"label"` for a static caption with arrow-only navigation.
     */
    captionLayout?: React.ComponentProps<typeof Calendar>["captionLayout"];
    /** Earliest navigable/selectable month. Defaults to today − 100 years when the header uses dropdowns. */
    startMonth?: Date;
    /** Latest navigable/selectable month. Defaults to today + 10 years when the header uses dropdowns. */
    endMonth?: Date;
    /**
     * Dates to disable, as a react-day-picker Matcher — e.g. `{ after: new Date() }`.
     */
    disabledDates?: React.ComponentProps<typeof Calendar>["disabled"];
    /**
     * date-fns locale for the trigger label and the month dropdown — e.g. `ptBR`
     * from `date-fns/locale`. Defaults to date-fns' built-in English locale.
     */
    locale?: Locale;
}
declare function DateRangePicker({ value, onValueChange, placeholder, disabled, className, dateFormat, captionLayout, startMonth, endMonth, disabledDates, locale, portalContainer, zIndex, }: Readonly<DateRangePickerProps>): import("react/jsx-runtime").JSX.Element;
export { DatePicker, DateRangePicker };
export type { DatePickerProps, DateRangePickerProps };
