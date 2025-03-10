import React from 'react';
import { Stack } from "expo-router";
import AppContextProvider from "@/contexts/AppContextProvider";

const StackLayout = () => {
    return(
        <AppContextProvider>
            <Stack>
                <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
            </Stack>
        </AppContextProvider>
    );
}

export default StackLayout;