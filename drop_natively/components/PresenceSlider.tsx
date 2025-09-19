
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedGestureHandler, 
  useAnimatedStyle, 
  useSharedValue,
  runOnJS,
  interpolate,
  Extrapolate,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { colors } from '../styles/commonStyles';

interface PresenceSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  title: string;
  subtitle?: string;
}

export default function PresenceSlider({ 
  value, 
  onValueChange, 
  title, 
  subtitle 
}: PresenceSliderProps) {
  const translateX = useSharedValue(value * 2.4); // Convert 0-100 to 0-240px
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => {
    translateX.value = withSpring(value * 2.4, {
      damping: 15,
      stiffness: 150,
    });
  }, [value]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
      scale.value = withSpring(1.2, { damping: 10, stiffness: 200 });
      glowOpacity.value = withTiming(1, { duration: 200 });
    },
    onActive: (event, context) => {
      const newX = Math.max(0, Math.min(240, context.startX + event.translationX));
      translateX.value = newX;
      const newValue = Math.round(newX / 2.4);
      runOnJS(setCurrentValue)(newValue);
      runOnJS(onValueChange)(newValue);
    },
    onEnd: () => {
      scale.value = withSpring(1, { damping: 10, stiffness: 200 });
      glowOpacity.value = withTiming(0, { duration: 300 });
    },
  });

  const thumbStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      translateX.value,
      [0, 60, 120, 180, 240],
      [colors.error, colors.warning, colors.primary, colors.secondary, colors.success]
    );

    return {
      transform: [
        { translateX: translateX.value },
        { scale: scale.value }
      ],
      backgroundColor,
      boxShadow: `0px 4px 12px ${backgroundColor}40`,
    };
  });

  const fillStyle = useAnimatedStyle(() => {
    const width = translateX.value + 20;
    const backgroundColor = interpolateColor(
      translateX.value,
      [0, 60, 120, 180, 240],
      [colors.error, colors.warning, colors.primary, colors.secondary, colors.success]
    );

    return {
      width: Math.max(20, width),
      backgroundColor,
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
      transform: [{ translateX: translateX.value }],
    };
  });

  const trackStyle = useAnimatedStyle(() => {
    const progress = translateX.value / 240;
    return {
      backgroundColor: interpolateColor(
        progress,
        [0, 0.5, 1],
        [colors.backgroundAlt, colors.backgroundAlt, colors.backgroundAlt]
      ),
    };
  });

  const getPresenceText = (val: number) => {
    if (val < 20) return 'Barely present';
    if (val < 40) return 'Somewhat present';
    if (val < 60) return 'Moderately present';
    if (val < 80) return 'Mostly present';
    return 'Fully embodied';
  };

  const getPresenceEmoji = (val: number) => {
    if (val < 20) return '😴';
    if (val < 40) return '😐';
    if (val < 60) return '🙂';
    if (val < 80) return '😊';
    return '✨';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      
      <View style={styles.sliderContainer}>
        <Animated.View style={[styles.track, trackStyle]}>
          <Animated.View style={[styles.fill, fillStyle]} />
          
          {/* Glow effect */}
          <Animated.View style={[styles.glow, glowStyle]} />
          
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={[styles.thumb, thumbStyle]}>
              <View style={styles.thumbInner} />
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
        
        {/* Progress markers */}
        <View style={styles.markersContainer}>
          {[0, 25, 50, 75, 100].map((marker) => (
            <View key={marker} style={styles.marker}>
              <View style={styles.markerDot} />
              <Text style={styles.markerText}>{marker}%</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.valueContainer}>
        <Text style={styles.valueText}>
          {currentValue}% {getPresenceEmoji(currentValue)}
        </Text>
        <Text style={styles.presenceText}>{getPresenceText(currentValue)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  sliderContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  track: {
    width: 260,
    height: 8,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 4,
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  glow: {
    position: 'absolute',
    top: -6,
    left: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    opacity: 0.3,
    transform: [{ scale: 2 }],
  },
  thumb: {
    position: 'absolute',
    top: -8,
    left: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
    elevation: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  thumbInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  markersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 260,
    marginTop: 12,
  },
  marker: {
    alignItems: 'center',
  },
  markerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textLight,
    marginBottom: 4,
  },
  markerText: {
    fontSize: 10,
    color: colors.textLight,
  },
  valueContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  valueText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  presenceText: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 4,
    fontWeight: '500',
  },
});
