import { render } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';
import Library from '@/app/(tabs)/library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllLibraryNovels } from '@/database/ExpoDB';
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
}));

jest.mock('@/database/ExpoDB', () => ({
    getAllLibraryNovels: jest.fn(),
    deleteLibraryNovel: jest.fn(),
    deleteNovelChapters: jest.fn(),
}));

describe('<Library />', () => {
    it('Jest works', () => {
        expect(1).toBe(1);
    });

    it('<Library /> pathname is obtained', async () => {
        renderRouter(['index', '(tabs)/library'], {
            initialUrl: '(tabs)/library',
        });
        expect(screen).toHavePathname('/library');
    });

    it('checks if Async Storage items can be gotten', async () => {
        (AsyncStorage.getItem).mockResolvedValueOnce('some_value');
        const userTheme = await AsyncStorage.getItem('THEME_KEY');
        expect(userTheme).toMatch('some_value');
    });

    it('renders <Library /> component', async () => {
        renderRouter(['(tabs)/library'], {
            initialUrl: '(tabs)/library',
        });
        screen.debug();
        const textElement = await screen.findByText('the perfect one for me.');
        expect(textElement).toBeTruthy();
    });
});