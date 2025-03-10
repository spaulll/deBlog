import React, { createContext, useContext, useState } from "react";

interface AuthContextType {
    isLoggedIn: boolean;
    setIsLoggedIn: (value: boolean) => void;
    avatarUrl: string | null;
    setAvatarUrl: (value: string | null) => void;
    userAddress: string | null;
    setUserAddress: (value: string | null) => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provide the context
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);  // ✅ State for avatar
    const [userAddress, setUserAddress] = useState<string | null>(null);  // ✅ State for userAddress

    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, avatarUrl, setAvatarUrl, userAddress, setUserAddress }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook to use the context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
