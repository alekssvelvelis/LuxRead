import { render } from '@testing-library/react-native';
import { renderRouter, screen, waitFor } from 'expo-router/testing-library';
import Library from '@/app/(tabs)/library';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NovelRowsProvider } from '@/contexts/NovelRowsContext';
import { NetworkProvider, useNetworkContext } from '@/contexts/NetworkContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllLibraryNovels } from '@/database/ExpoDB';
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
}));

jest.mock('@/database/ExpoDB', () => ({
    getAllLibraryNovels: jest.fn(),
}));

jest.mock('expo-router', () => ({
    useRouter: () => ({
      navigate: jest.fn(),
    }),
    useFocusEffect: jest.fn((fn) => fn()),
    usePathname: jest.fn(() => '/library'),
    useNavigateBack: jest.fn(() => jest.fn()),
}));

jest.mock('@/contexts/NetworkContext', () => {
    return {
        NetworkProvider: ({ children }) => children,
        useNetworkContext: jest.fn(() => ({
            isInternetReachable: true,  // You can set it to true or false as needed for your tests
        })),
    };
});

const renderWithProviders = (ui) => {
    return render(
        <ThemeProvider>
            <NovelRowsProvider>
                <NetworkProvider>
                    {ui}
                </NetworkProvider>
            </NovelRowsProvider>
        </ThemeProvider>
    );
};

describe('<Library />', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

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

    it('renders <Library /> component and finds specific text', async () => {
        // Mocking getAllLibraryNovels to return some test novels
        getAllLibraryNovels.mockResolvedValueOnce([
            { id: 1, title: 'Novel 1', author: 'Author 1', chapterCount: 10, imageURL: 'https://example.com/image1.jpg', novelPageURL: '/novel/1', novelSource: 'source1' },
            { id: 2, title: 'Novel 2', author: 'Author 2', chapterCount: 5, imageURL: 'https://example.com/image2.jpg', novelPageURL: '/novel/2', novelSource: 'source2' },
        ]);

        // Use custom renderWithProviders function to render the component with providers
        renderWithProviders(<Library />);

        // Use waitFor to wait for the component to update
        await waitFor(() => {
            // Expect the text 'the perfect one for me.' to be in the document
            const textElement = screen.getByText('the perfect one for me.');
            expect(textElement).toBeTruthy();
        });
    });
});