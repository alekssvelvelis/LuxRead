import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getNovelLayout } from '@/utils/mmkv';

type NovelLayoutContextType = {
    value: string;
    setNovelLayoutValue: (value: string) => void;
};

const NovelLayoutContext = createContext<NovelLayoutContextType | undefined>(undefined);

export const NovelLayoutProvider = ({children}:  { children: ReactNode }) =>  {
    const [value, setNovelLayoutValue] = useState<string>('Title under novel');
    
    useEffect(() => {
        const loadNovelLayout = async () => {
            try {
                const savedValue = await getNovelLayout();
                if (savedValue) {
                    setNovelLayoutValue(savedValue);
                }
            } catch (error) {
                console.error('Failed to load the novel rows from storage:', error);
            }
        };

        loadNovelLayout();
    }, []);
    return (
        <NovelLayoutContext.Provider value={{ value, setNovelLayoutValue }}>
            {children}
        </NovelLayoutContext.Provider>
    );
};

export const useNovelLayoutContext = () => {
    const context = useContext(NovelLayoutContext);
    if (!context) {
        throw new Error('useNovelLayout must be used within NovelLayoutContext');
    }
    return context;
}
