import {createContext, useContext} from "react";

export interface ActiveFileContextType {
    activeFileContent: string;
    setActiveFileContent: (content: string) => void;
}

/* Context that stores the contents of the currently opened file, or null if none are opened. */
export const ActiveFileContext = createContext<ActiveFileContextType | undefined>(undefined);

export const useActiveFileContext = () => {
    const context = useContext(ActiveFileContext);
    if (!context) { throw new Error("useActiveFileContext must be used within the context"); }
    return context;
}