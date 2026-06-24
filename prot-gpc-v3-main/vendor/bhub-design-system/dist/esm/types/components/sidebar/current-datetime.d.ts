type CurrentDateTimeProps = {
    className?: string;
    /** Fixed date for demos/tests. When omitted, uses a live clock. */
    date?: Date;
    locale?: string;
};
declare function CurrentDateTime({ className, date: fixedDate, locale, }: CurrentDateTimeProps): import("react/jsx-runtime").JSX.Element;
export { CurrentDateTime };
export type { CurrentDateTimeProps };
