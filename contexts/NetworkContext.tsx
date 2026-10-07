import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

type NetworkContextType = {
    isConnected: boolean | null,
}
const NetworkContext = createContext<NetworkContextType | undefined>(undefined);


export const NetworkProvider = ({children}:  { children: ReactNode }) => {
    const [isConnected, setIsConnected] = useState<boolean>(true);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            setIsConnected(state.isConnected !== false);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <>
            {typeof isConnected !== null ? 
            <NetworkContext.Provider value={{ isConnected }}>
                {children}
            </NetworkContext.Provider> :  null}
        </>
    );
};

export const useNetwork = () => {
    const context = useContext(NetworkContext);
    if (!context) {
        throw new Error('useNetwork must be used within NetworkContext');
    }
    return context;
};