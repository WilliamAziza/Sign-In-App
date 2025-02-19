import { useColorScheme as _useColorScheme } from 'react-native';

export const useColorScheme = () => {
  const systemScheme = _useColorScheme();
  
  // Return the system color scheme (light/dark)
  return systemScheme;
};

export const Colors = {
  light: {
    background: '#FFFFFF',
    text: '#000000',
    primary: '#007AFF',
    card: '#F2F2F7',
    border: '#C6C6C8',
  },
  dark: {
    background: '#000000',
    text: '#FFFFFF',
    primary: '#0A84FF',
    card: '#1C1C1E',
    border: '#3A3A3C',
  },
};
