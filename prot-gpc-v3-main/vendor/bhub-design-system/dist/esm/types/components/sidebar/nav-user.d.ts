type NavUserUser = {
    name: string;
    email: string;
    avatar?: string;
    scope: string;
};
type NavUserProps = {
    user: NavUserUser;
};
declare function NavUser({ user }: NavUserProps): import("react/jsx-runtime").JSX.Element;
export { NavUser };
export type { NavUserUser, NavUserProps };
