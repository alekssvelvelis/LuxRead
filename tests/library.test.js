import { render } from '@testing-library/react-native';
import { renderRouter, screen, waitFor } from 'expo-router/testing-library';
import Library from '@/app/(tabs)/library';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NovelRowsProvider } from '@/contexts/NovelRowsContext';
import { NetworkProvider, useNetworkContext } from '@/contexts/NetworkContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
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
            isInternetReachable: true,
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

    it('renders <Library /> component and displays novel titles', async () => {
        renderWithProviders(<Library />);
        await waitFor(() => {
            const titleElement = screen.findByText('You have no saved novels. Navigate to Sources and find what to read.');
            expect(titleElement).toBeTruthy();
        });
    });
});