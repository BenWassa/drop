
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enhanced storage hook with proper persistence, error handling, and validation
export function useStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    loadStoredValue();
  }, [key]);

  const loadStoredValue = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const item = await AsyncStorage.getItem(key);
      if (item !== null) {
        const parsedValue = JSON.parse(item);
        
        // Validate the parsed value structure
        if (validateValue(parsedValue, initialValue)) {
          setStoredValue(parsedValue);
          console.log(`💧 Loaded ${key} from storage:`, parsedValue);
        } else {
          console.log(`⚠️ Invalid data structure for ${key}, using initial value`);
          setStoredValue(initialValue);
          // Save the initial value to fix corrupted data
          await AsyncStorage.setItem(key, JSON.stringify(initialValue));
        }
      } else {
        console.log(`💧 No stored value for ${key}, using initial value`);
        setStoredValue(initialValue);
      }
    } catch (error) {
      console.log(`❌ Error loading ${key}:`, error);
      setError(`Failed to load ${key}`);
      setStoredValue(initialValue);
    } finally {
      setIsLoading(false);
    }
  };

  const setValue = useCallback(async (value: T | ((val: T) => T)) => {
    try {
      setError(null);
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Validate before storing
      if (!validateValue(valueToStore, initialValue)) {
        throw new Error('Invalid data structure');
      }
      
      setStoredValue(valueToStore);
      await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
      
      console.log(`💧 Saved ${key} to storage:`, valueToStore);
    } catch (error) {
      console.log(`❌ Error saving ${key}:`, error);
      setError(`Failed to save ${key}`);
    }
  }, [key, storedValue, initialValue]);

  const clearValue = useCallback(async () => {
    try {
      setError(null);
      await AsyncStorage.removeItem(key);
      setStoredValue(initialValue);
      console.log(`🗑️ Cleared ${key} from storage`);
    } catch (error) {
      console.log(`❌ Error clearing ${key}:`, error);
      setError(`Failed to clear ${key}`);
    }
  }, [key, initialValue]);

  // Basic validation to ensure data structure integrity
  const validateValue = (value: any, template: any): boolean => {
    if (typeof value !== typeof template) return false;
    
    if (Array.isArray(template)) {
      return Array.isArray(value);
    }
    
    if (typeof template === 'object' && template !== null) {
      if (typeof value !== 'object' || value === null) return false;
      
      // Check if all required keys exist
      const templateKeys = Object.keys(template);
      const valueKeys = Object.keys(value);
      
      return templateKeys.every(key => valueKeys.includes(key));
    }
    
    return true;
  };

  return [storedValue, setValue, isLoading, error, clearValue] as const;
}
