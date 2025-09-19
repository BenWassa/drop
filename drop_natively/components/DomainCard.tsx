
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';
import { Domain } from '../types';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

interface DomainCardProps {
  domain: Domain;
  onPress: () => void;
  onLogPress: () => void;
}

export default function DomainCard({ domain, onPress, onLogPress }: DomainCardProps) {
  const scale = useSharedValue(1);
  const progressWidth = useSharedValue(0);

  React.useEffect(() => {
    progressWidth.value = withSpring(domain.progress, {
      damping: 15,
      stiffness: 100,
    });
  }, [domain.progress]);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const progressStyle = useAnimatedStyle(() => {
    const width = interpolate(
      progressWidth.value,
      [0, 100],
      [0, 100],
      Extrapolate.CLAMP
    );
    
    return {
      width: `${width}%`,
    };
  });

  const getProgressColor = (progress: number) => {
    if (progress < 25) return colors.error;
    if (progress < 50) return colors.warning;
    if (progress < 75) return colors.primary;
    return colors.success;
  };

  const getStreakText = () => {
    // This would be calculated from actual data in a real app
    const streak = Math.floor(Math.random() * 7) + 1;
    return `${streak} day streak`;
  };

  return (
    <Animated.View style={[styles.container, cardStyle]}>
      <TouchableOpacity 
        style={styles.touchable}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: `${domain.color}20` }]}>
            <Ionicons 
              name={domain.icon as any} 
              size={28} 
              color={domain.color} 
            />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{domain.name}</Text>
            <Text style={styles.subtitle}>
              {domain.currentIdentity || 'No identity selected'}
            </Text>
            {domain.isLogged && (
              <Text style={styles.streakText}>{getStreakText()}</Text>
            )}
          </View>
          <TouchableOpacity 
            style={[
              styles.logButton,
              { 
                backgroundColor: domain.isLogged ? colors.success : colors.backgroundAlt,
                borderColor: domain.isLogged ? colors.success : colors.primary,
              }
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onLogPress();
            }}
          >
            <Ionicons 
              name={domain.isLogged ? "checkmark" : "add"} 
              size={18} 
              color={domain.isLogged ? "white" : colors.primary} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                progressStyle,
                { 
                  backgroundColor: getProgressColor(domain.progress),
                }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: getProgressColor(domain.progress) }]}>
            {Math.round(domain.progress)}%
          </Text>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { 
            backgroundColor: domain.isLogged ? colors.success : colors.grey 
          }]} />
          <Text style={styles.statusText}>
            {domain.isLogged ? 'Logged today' : 'Tap to log presence'}
          </Text>
          
          {domain.progress > 0 && (
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>
                {domain.progress >= 75 ? '🌊' : domain.progress >= 50 ? '💧' : '💦'}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
    elevation: 4,
    overflow: 'hidden',
  },
  touchable: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 2,
  },
  streakText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '500',
  },
  logButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: colors.textLight,
    flex: 1,
  },
  progressBadge: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  progressBadgeText: {
    fontSize: 16,
  },
});
