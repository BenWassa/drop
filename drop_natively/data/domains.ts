
import { Domain } from '../types';
import { colors } from '../styles/commonStyles';

export const domains: Domain[] = [
  {
    id: 'sleep',
    name: 'Sleep',
    icon: 'moon-outline',
    color: colors.primary,
    progress: 0,
    isLogged: false,
  },
  {
    id: 'fitness',
    name: 'Fitness',
    icon: 'body-outline',
    color: colors.secondary,
    progress: 0,
    isLogged: false,
  },
  {
    id: 'mind',
    name: 'Mind',
    icon: 'library-outline',
    color: colors.accent,
    progress: 0,
    isLogged: false,
  },
  {
    id: 'spirit',
    name: 'Spirit',
    icon: 'flower-outline',
    color: colors.success,
    progress: 0,
    isLogged: false,
  },
];
