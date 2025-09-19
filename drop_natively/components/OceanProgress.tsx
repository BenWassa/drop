
import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolate,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { colors, commonStyles } from '../styles/commonStyles';

interface OceanProgressProps {
  progress: number; // 0-100
  title: string;
  subtitle?: string;
}

const { width: screenWidth } = Dimensions.get('window');

export default function OceanProgress({ progress, title, subtitle }: OceanProgressProps) {
  const oceanHeight = useSharedValue(4);
  const waveOffset1 = useSharedValue(0);
  const waveOffset2 = useSharedValue(0);
  const waveOffset3 = useSharedValue(0);
  const dropOpacity = useSharedValue(0);
  const bubbleOpacity = useSharedValue(0);
  const shimmerOffset = useSharedValue(-screenWidth);

  useEffect(() => {
    // Enhanced ocean filling animation with bounce
    oceanHeight.value = withSpring(Math.max(4, (progress / 100) * 120), {
      damping: 12,
      stiffness: 80,
      mass: 1,
    });

    // Multiple wave layers for depth
    waveOffset1.value = withRepeat(
      withTiming(40, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    
    waveOffset2.value = withRepeat(
      withTiming(-30, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    
    waveOffset3.value = withRepeat(
      withTiming(25, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );

    // Enhanced drop animation with staggered appearance
    dropOpacity.value = withTiming(progress > 0 ? 1 : 0, { 
      duration: 1200,
      easing: Easing.out(Easing.quad)
    });

    // Bubble effects for active progress
    if (progress > 20) {
      bubbleOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1500 }),
          withTiming(0.2, { duration: 1500 })
        ),
        -1,
        false
      );
    } else {
      bubbleOpacity.value = withTiming(0, { duration: 500 });
    }

    // Shimmer effect for high progress
    if (progress > 70) {
      shimmerOffset.value = withRepeat(
        withTiming(screenWidth, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [progress]);

  const oceanStyle = useAnimatedStyle(() => {
    return {
      height: oceanHeight.value,
      backgroundColor: interpolate(
        progress,
        [0, 50, 100],
        [colors.ocean, colors.primary, colors.secondary],
        Extrapolate.CLAMP
      ),
    };
  });

  const wave1Style = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: waveOffset1.value }],
      opacity: 0.8,
    };
  });

  const wave2Style = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: waveOffset2.value }],
      opacity: 0.6,
    };
  });

  const wave3Style = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: waveOffset3.value }],
      opacity: 0.4,
    };
  });

  const dropsStyle = useAnimatedStyle(() => {
    return {
      opacity: dropOpacity.value,
    };
  });

  const bubblesStyle = useAnimatedStyle(() => {
    return {
      opacity: bubbleOpacity.value,
    };
  });

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shimmerOffset.value }],
      opacity: progress > 70 ? 0.3 : 0,
    };
  });

  const getDropPositions = useMemo(() => {
    const dropCount = Math.floor(progress / 6);
    return Array.from({ length: Math.min(dropCount, 15) }).map((_, index) => ({
      left: `${8 + (index * 5.5)}%`,
      top: `${5 + (index % 5) * 18}%`,
      delay: index * 120,
      size: 6 + (index % 3) * 2,
    }));
  }, [progress]);

  const getBubblePositions = useMemo(() => {
    if (progress < 20) return [];
    const bubbleCount = Math.floor(progress / 15);
    return Array.from({ length: Math.min(bubbleCount, 8) }).map((_, index) => ({
      left: `${20 + (index * 8)}%`,
      bottom: `${10 + (index % 3) * 15}%`,
      delay: index * 200,
      size: 3 + (index % 2) * 2,
    }));
  }, [progress]);

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      
      <View style={commonStyles.oceanContainer}>
        <Animated.View style={[commonStyles.ocean, oceanStyle]}>
          {/* Multiple wave layers for depth */}
          <Animated.View style={[styles.wave, wave1Style]} />
          <Animated.View style={[styles.wave2, wave2Style]} />
          <Animated.View style={[styles.wave3, wave3Style]} />
          
          {/* Shimmer effect for high progress */}
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </Animated.View>
        
        {/* Animated drops */}
        <Animated.View style={[styles.dropsContainer, dropsStyle]}>
          {getDropPositions.map((drop, index) => (
            <AnimatedDrop
              key={index}
              left={drop.left}
              top={drop.top}
              delay={drop.delay}
              size={drop.size}
            />
          ))}
        </Animated.View>

        {/* Bubble effects */}
        <Animated.View style={[styles.bubblesContainer, bubblesStyle]}>
          {getBubblePositions.map((bubble, index) => (
            <AnimatedBubble
              key={index}
              left={bubble.left}
              bottom={bubble.bottom}
              delay={bubble.delay}
              size={bubble.size}
            />
          ))}
        </Animated.View>
      </View>
      
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>{Math.round(progress)}% filled</Text>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
              }
            ]} 
          />
        </View>
      </View>
    </View>
  );
}

function AnimatedDrop({ left, top, delay, size }: { 
  left: string; 
  top: string; 
  delay: number;
  size: number;
}) {
  const scale = useSharedValue(0);
  const translateY = useSharedValue(-15);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      scale.value = withSpring(1, { damping: 10, stiffness: 150 });
      translateY.value = withSpring(0, { damping: 12, stiffness: 100 });
      opacity.value = withTiming(0.9, { duration: 600 });
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const dropStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View 
      style={[
        styles.drop,
        {
          left,
          top,
          width: size,
          height: size + 2,
        },
        dropStyle,
      ]}
    />
  );
}

function AnimatedBubble({ left, bottom, delay, size }: { 
  left: string; 
  bottom: string; 
  delay: number;
  size: number;
}) {
  const scale = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      scale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800 }),
          withTiming(0.8, { duration: 800 })
        ),
        -1,
        true
      );
      
      translateY.value = withRepeat(
        withTiming(-20, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
      
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 800 }),
          withTiming(0.2, { duration: 800 })
        ),
        -1,
        true
      );
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const bubbleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View 
      style={[
        styles.bubble,
        {
          left,
          bottom,
          width: size,
          height: size,
        },
        bubbleStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  textContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 20,
  },
  progressContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  dropsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bubblesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  drop: {
    position: 'absolute',
    backgroundColor: colors.drop,
    borderRadius: 4,
    opacity: 0.8,
  },
  bubble: {
    position: 'absolute',
    backgroundColor: colors.wave,
    borderRadius: 50,
    opacity: 0.4,
  },
  wave: {
    position: 'absolute',
    top: -2,
    left: -20,
    right: -20,
    height: 4,
    backgroundColor: colors.wave,
    borderRadius: 2,
  },
  wave2: {
    position: 'absolute',
    top: -1,
    left: -15,
    right: -15,
    height: 3,
    backgroundColor: colors.secondary,
    opacity: 0.6,
    borderRadius: 2,
  },
  wave3: {
    position: 'absolute',
    top: -3,
    left: -25,
    right: -25,
    height: 2,
    backgroundColor: colors.accent,
    opacity: 0.4,
    borderRadius: 1,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
  },
});
