import * as React from "react";
export type Workspace = {
    id: string;
    name: string;
    logo?: React.ReactNode;
    identifier?: string;
};
type WorkspaceSwitcherProps = {
    workspaces: Workspace[];
    activeWorkspaceId: string;
    onWorkspaceChange: (id: string) => void;
};
declare function WorkspaceSwitcher({ workspaces, activeWorkspaceId, onWorkspaceChange, }: WorkspaceSwitcherProps): import("react/jsx-runtime").JSX.Element | null;
export { WorkspaceSwitcher };
