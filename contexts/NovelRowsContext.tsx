import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { saveItem, getItem } from '@/utils/asyncStorage';

type NovelRowsContextType = {
    value: string;
    setValue: (value: string) => void;
};

const NovelRowsContext = createContext<NovelRowsContextType | undefined>(undefined);

export const NovelRowsProvider = ({ children }: { children: ReactNode }) => {
    const [value, setValue] = useState<string>('1'); // Initial value for TS

    useEffect(() => {
        const loadNovelRows = async () => {
            try {
                const savedValue = await getItem('NovelRows');
                if (savedValue) {
                    setValue(savedValue);
                }
            } catch (error) {
                console.error('Failed to load the novel rows from storage:', error);
            }
        };

        loadNovelRows();
    }, []);

    const updateValue = async (newValue: string) => {
        setValue(newValue);
        await saveItem('NovelRows', newValue);
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
