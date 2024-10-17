import { Stack } from "expo-router";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NovelRowsProvider } from "@/contexts/NovelRowsContext";
import { NetworkProvider } from "@/contexts/NetworkContext";
const StackLayout = () => {
    return(
        <ThemeProvider>
            <NovelRowsProvider>
            <NetworkProvider>
            <Stack>
                <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
            </Stack>
            </NetworkProvider>
            </NovelRowsProvider>
        </ThemeProvider>
    );
}

export default StackLayout;