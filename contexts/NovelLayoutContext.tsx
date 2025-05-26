import React, { createContext, useContext, useState, useEffect } from 'react';
import { getNovelLayout } from '@/utils/asyncStorage';

const NovelLayoutContext = createContext<{ value: string; setNovelLayoutValue: (layout: string) => void }>({
    value: 'Title under novel',
    setNovelLayoutValue: () => {},
});



export const NovelLayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

export const useNovelLayoutContext = () => useContext(NovelLayoutContext);