
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  primary: '#2E8B8B',      // Teal - main ocean color
  secondary: '#4FB3B3',    // Light teal
  accent: '#87CEEB',       // Sky blue
  background: '#F8FFFE',   // Very light seafoam
  backgroundAlt: '#E8F6F6', // Light seafoam
  text: '#2C3E50',         // Dark blue-gray
  textLight: '#5A6C7D',    // Medium blue-gray
  grey: '#B0C4DE',         // Light steel blue
  card: '#FFFFFF',         // Pure white for cards
  success: '#20B2AA',      // Light sea green
  warning: '#FFB347',      // Peach
  error: '#FF6B6B',        // Coral red
  ocean: '#006994',        // Deep ocean blue
  wave: '#40E0D0',         // Turquoise
  drop: '#87CEEB',         // Sky blue for drops
  
  // Enhanced color palette for better UX
  primaryLight: '#5DAAAA',
  primaryDark: '#1A5F5F',
  successLight: '#66D9D9',
  warningLight: '#FFD700',
  errorLight: '#FF9999',
  
  // Gradient colors
  gradientStart: '#2E8B8B',
  gradientEnd: '#4FB3B3',
};

export const shadows = {
  small: {
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  medium: {
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  large: {
    boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.12)',
    elevation: 6,
  },
  ocean: {
    boxShadow: '0px 4px 12px rgba(46, 139, 139, 0.2)',
    elevation: 4,
  },
};

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.ocean,
  },
  secondary: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    ...shadows.small,
  },
  domain: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    marginVertical: 8,
    marginHorizontal: 16,
    ...shadows.medium,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  floating: {
    backgroundColor: colors.primary,
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 24,
    right: 24,
    ...shadows.large,
  },
});

export const textStyles = StyleSheet.create({
  h1: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 24,
  },
  bodyLight: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textLight,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textLight,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textLight,
    lineHeight: 16,
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    width: '100%',
  },
  contentPadded: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
  },
  title: {
    ...textStyles.h1,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...textStyles.h3,
    marginBottom: 16,
  },
  text: {
    ...textStyles.body,
  },
  textLight: {
    ...textStyles.bodyLight,
  },
  textSmall: {
    ...textStyles.caption,
  },
  section: {
    width: '100%',
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    ...shadows.medium,
  },
  cardLarge: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    marginVertical: 12,
    ...shadows.medium,
  },
  domainCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    marginVertical: 12,
    marginHorizontal: 16,
    ...shadows.large,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowStart: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
  },
  
  // Enhanced ocean container with better styling
  oceanContainer: {
    height: 140,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 16,
    marginHorizontal: 16,
    position: 'relative',
    ...shadows.medium,
  },
  ocean: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.ocean,
    borderRadius: 20,
  },
  wave: {
    position: 'absolute',
    top: -2,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.wave,
  },
  
  // Animation helpers
  fadeIn: {
    opacity: 1,
  },
  fadeOut: {
    opacity: 0,
  },
  scaleUp: {
    transform: [{ scale: 1.05 }],
  },
  scaleDown: {
    transform: [{ scale: 0.95 }],
  },
  
  // Layout helpers
  flex1: {
    flex: 1,
  },
  flexRow: {
    flexDirection: 'row',
  },
  flexColumn: {
    flexDirection: 'column',
  },
  alignCenter: {
    alignItems: 'center',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  justifyBetween: {
    justifyContent: 'space-between',
  },
  justifyAround: {
    justifyContent: 'space-around',
  },
  
  // Spacing helpers
  mt8: { marginTop: 8 },
  mt16: { marginTop: 16 },
  mt24: { marginTop: 24 },
  mb8: { marginBottom: 8 },
  mb16: { marginBottom: 16 },
  mb24: { marginBottom: 24 },
  mx16: { marginHorizontal: 16 },
  my16: { marginVertical: 16 },
  p16: { padding: 16 },
  p24: { padding: 24 },
  px16: { paddingHorizontal: 16 },
  py16: { paddingVertical: 16 },
});
