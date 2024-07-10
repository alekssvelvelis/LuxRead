// useAppTheme.tsx
// import { useEffect } from 'react';
// import { useTheme } from '@/contexts/ThemeContext';
// import { getUserTheme } from '@/utils/asyncStorage';

// export const useAppTheme = () => {
//   const { theme, setTheme } = useTheme();

//   useEffect(() => {
//     const loadTheme = async () => {
//       const savedTheme = await getUserTheme();
//       if (savedTheme) {
//         setTheme(savedTheme);
//       }
//     };
//     loadTheme();
//   }, [setTheme]);

//   return theme;
// };
