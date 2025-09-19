
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { colors, shadows } from '../styles/commonStyles';

interface SimpleBottomSheetProps {
  children?: React.ReactNode;
  isVisible?: boolean;
  onClose?: () => void;
  snapPoints?: number[];
  initialSnapPoint?: number;
}

const { height: screenHeight } = Dimensions.get('window');
const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

const DEFAULT_SNAP_POINTS = [0.4, 0.7, 0.9]; // Percentage of screen height

export default function SimpleBottomSheet({ 
  children, 
  isVisible = false, 
  onClose,
  snapPoints = DEFAULT_SNAP_POINTS,
  initialSnapPoint = 0
}: SimpleBottomSheetProps) {
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [currentSnapIndex, setCurrentSnapIndex] = useState(initialSnapPoint);

  const snapPointsInPixels = snapPoints.map(point => 
    screenHeight - (screenHeight * point) - statusBarHeight
  );

  useEffect(() => {
    if (isVisible) {
      // Show the bottom sheet
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: snapPointsInPixels[currentSnapIndex],
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide the bottom sheet
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: screenHeight,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, currentSnapIndex]);

  const handleBackdropPress = () => {
    onClose?.();
  };

  const snapToPoint = (index: number) => {
    if (index < 0 || index >= snapPointsInPixels.length) {
      onClose?.();
      return;
    }

    setCurrentSnapIndex(index);
    Animated.spring(translateY, {
      toValue: snapPointsInPixels[index],
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const getClosestSnapPoint = (currentY: number, velocityY: number): number => {
    const currentPosition = currentY;
    
    // If velocity is high, predict where it would end up
    const projectedEndpoint = currentPosition + velocityY * 0.1;
    
    let closestIndex = 0;
    let closestDistance = Math.abs(projectedEndpoint - snapPointsInPixels[0]);
    
    snapPointsInPixels.forEach((point, index) => {
      const distance = Math.abs(projectedEndpoint - point);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    
    // If dragging down with high velocity, close the sheet
    if (velocityY > 1000 && currentPosition > snapPointsInPixels[snapPointsInPixels.length - 1]) {
      return -1; // Close
    }
    
    return closestIndex;
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { 
      useNativeDriver: true,
      listener: (event) => {
        const { translationY } = event.nativeEvent;
        const newY = snapPointsInPixels[currentSnapIndex] + translationY;
        
        // Prevent dragging above the highest snap point
        if (newY < snapPointsInPixels[0]) {
          return;
        }
        
        translateY.setValue(newY);
      }
    }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY, velocityY } = event.nativeEvent;
      const currentY = snapPointsInPixels[currentSnapIndex] + translationY;
      
      const targetIndex = getClosestSnapPoint(currentY, velocityY);
      snapToPoint(targetIndex);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <Animated.View 
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacity,
              }
            ]} 
          />
        </TouchableWithoutFeedback>
        
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View
            style={[
              styles.bottomSheet,
              {
                transform: [{ translateY }],
              }
            ]}
          >
            <View style={styles.handle} />
            <View style={styles.content}>
              {children}
            </View>
          </Animated.View>
        </PanGestureHandler>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
  bottomSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: screenHeight * 0.4,
    maxHeight: screenHeight * 0.95,
    ...shadows.large,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16, // Account for home indicator
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.grey,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
});
