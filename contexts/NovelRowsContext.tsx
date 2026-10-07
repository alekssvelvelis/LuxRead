import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { saveNovelRows, getNovelRows } from '@/utils/mmkv';

type NovelRowsContextType = {
    value: number;
    setValue: (value: number) => void;
};

const NovelRowsContext = createContext<NovelRowsContextType | undefined>(undefined);

export const NovelRowsProvider = ({ children }: { children: ReactNode }) => {
    const [value, setValue] = useState<number>(1); // Initial value for TS

    useEffect(() => {
        const loadNovelRows = async () => {
            try {
                const savedValue = await getNovelRows();
                if (savedValue) {
                    setValue(savedValue);
                }
            } catch (error) {
                console.error('Failed to load the novel rows from storage:', error);
            }
        };

        loadNovelRows();
    }, []);

    const updateValue = async (newValue: number) => {
        setValue(newValue);
        await saveNovelRows(newValue);
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
        throw new Error('useNovelRowsContext must be used within NovelRowsProvider');
    }
    return context;
};
