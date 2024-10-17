import { router, usePathname } from 'expo-router';

const useNavigateBack = () => {
    const pathname = usePathname();
    const isCoreTab = pathname === '/library' || pathname === '/sources';
    const navigateBack = () => {
        if(!isCoreTab){
            router.back();
        }
    }
    return navigateBack;
}

export default useNavigateBack;