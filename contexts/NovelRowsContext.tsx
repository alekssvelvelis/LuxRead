// NovelRowsContext.tsx

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { storeNovelRows, getNovelRows } from '@/utils/asyncStorage';

type NovelRowsContextType = {
    value: string;
    setValue: (value: string) => void;
};

const NovelRowsContext = createContext<NovelRowsContextType | undefined>(undefined);
export const NovelRowsProvider = ({children}:  { children: ReactNode } ) => {
    const [value, setValue] = useState<any>('1'); // Initial value for TS

    useState(() => {
        const loadNovelRows = async () => {
            try {
                const savedValue = await getNovelRows('NovelRows');
                if (savedValue) {
                    setValue(savedValue);
                }
            } catch (error) {
                console.error('Failed to load the novel rows from storage:', error);
            }
        };

        loadNovelRows();
    });

    const updateValue = async (newValue: string) => {
        setValue(newValue);
        await storeNovelRows('NovelRows', newValue);
    };

    return (
        <NovelRowsContext.Provider value={{ value, setValue: updateValue }}>
            {children}
        </NovelRowsContext.Provider>
    );
};

export const useNovelRowsContext = () => {
    const context = useContext(NovelRowsContext);
    if (!context) {
        throw new Error('useNovelRowsContext must be used within a NovelRowsProvider');
    }
    return context;
};
