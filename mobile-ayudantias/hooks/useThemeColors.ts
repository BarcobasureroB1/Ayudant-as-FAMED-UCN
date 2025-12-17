import { useColorScheme } from 'react-native';

const lightColors = {
  background: '#F3F4F6', 
  card: '#FFFFFF',       
  text: '#111827',       
  textLabel: '#374151',  
  textPlaceholder: '#9CA3AF', 
  icon: '#6B7280',        
  inputBackground: '#F9FAFB', 
  inputBorder: '#D1D5DB', 
  primary: '#007AFF',      
  primaryText: '#FFFFFF', 
  error: '#EF4444',       
  errorBorder: '#EF4444',
};

const darkColors = {
  background: '#111827', 
  card: '#1F2937',       
  text: '#F9FAFB',       
  textLabel: '#D1D5DB',  
  textPlaceholder: '#8690a5ff', 
  icon: '#9CA3AF',        
  inputBackground: '#374151', 
  inputBorder: '#4B5563', 
  primary: '#0D6EFD',      
  primaryText: '#FFFFFF', 
  error: '#F87171',       
  errorBorder: '#EF4444',
};


export const useThemeColors = () => {
  const colorScheme = useColorScheme();

  if (colorScheme === 'dark') {
    return darkColors;
  } else {
    
    return lightColors;
  }
};