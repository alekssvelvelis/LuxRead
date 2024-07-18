import { Stack } from "expo-router";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NovelRowsProvider } from "@/contexts/NovelRowsContext";
const StackLayout = () => {
    return(
        <ThemeProvider>
            <NovelRowsProvider>
            <Stack>
                <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
            </Stack>
            </NovelRowsProvider>
        </ThemeProvider>
    );
}

export default StackLayout;