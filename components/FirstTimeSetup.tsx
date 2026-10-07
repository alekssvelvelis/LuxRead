import React, { useEffect, useState } from 'react';
import { removeItem, getOnboardingDone, saveOnboardingDone } from '@/utils/mmkv';
import { setupNovelChaptersTable, setupLibraryNovelsTable, setupSourcesTable, setupDownloadedChaptersTable } from '@/database/ExpoDB';

const ONBOARDING_KEY = 'onboardingDone';
 
const resetFirstLaunch = () => {
  try {
    removeItem(ONBOARDING_KEY);
    console.log('First launch flag "onboardingDone" reset successfully');
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
      let isOnboardingDone: number | undefined = undefined;
      try {
        isOnboardingDone = await getOnboardingDone();
        console.log('checking onboardingDone flag');
        if(isOnboardingDone){
          console.log('onboarding already complete');
          return;
        }

        console.log('first launch = true, running onboarding');
        await setupNovelChaptersTable();
        await setupLibraryNovelsTable();
        await setupSourcesTable();
        await setupDownloadedChaptersTable();
        saveOnboardingDone(1);

      } catch (error) {
        console.error('Error during first launch onboarding', error);
      } finally {
        setIsLoading(false);
        console.log('first launch onboarding done');
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