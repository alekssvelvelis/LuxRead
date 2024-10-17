import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

const NetworkContext = createContext({
    isConnected: true,
});

export const NetworkProvider = ({children}:  { children: ReactNode } ) => {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            setIsConnected(state.isConnected);
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

// Custom hook to consume the network context in other components
export const useNetwork = () => useContext(NetworkContext);
