import React, { useEffect, useState } from 'react';
import { mmkv } from '@/utils/mmkv';
import { setupNovelChaptersTable, setupLibraryNovelsTable, setupSourcesTable, setupDownloadedChaptersTable } from '@/database/ExpoDB';

const FIRST_LAUNCH_KEY = 'isFirstLaunch';
 
const resetFirstLaunch = () => {
  try {
    mmkv.remove(FIRST_LAUNCH_KEY);
    console.log('First launch flag reset successfully');
  } catch (error) {
    console.error('Error resetting first launch flag', error);
  }
};

const FirstLaunchSetup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // useEffect(() => {
  //   resetFirstLaunch();
  // },[])
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      let isFirstLaunch: boolean | undefined = undefined;
      try {
        isFirstLaunch =  mmkv.getBoolean(FIRST_LAUNCH_KEY);
        console.log('first launch');
        if(!isFirstLaunch) return;

        console.log('first launch is null');
        await setupNovelChaptersTable();
        await setupLibraryNovelsTable();
        await setupSourcesTable();
        await setupDownloadedChaptersTable();
        mmkv.set(FIRST_LAUNCH_KEY, false);

      } catch (error) {
        console.error('Error during first launch setup', error);
      } finally {
        setIsLoading(false);
        // console.log('first launch finally');
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return null;
  }

  return <>{children}</>;
};

export default FirstLaunchSetup;