import React, { createContext, useContext, useState, useCallback } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AlertOptions {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onConfirm?: () => void;
  confirmText?: string;
  showCancel?: boolean;
  cancelText?: string;
}

interface CustomAlertContextType {
  showAlert: (options: AlertOptions) => void;
}

const CustomAlertContext = createContext<CustomAlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(CustomAlertContext);
  if (!context) {
    throw new Error('useAlert must be used within a CustomAlertProvider');
  }
  return context;
};

export const CustomAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<AlertOptions | null>(null);
  const [scaleValue] = useState(new Animated.Value(0));

  const showAlert = useCallback((newOptions: AlertOptions) => {
    setOptions(newOptions);
    setVisible(true);
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [scaleValue]);

  const hideAlert = useCallback(() => {
    Animated.timing(scaleValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setOptions(null);
    });
  }, [scaleValue]);

  const handleConfirm = () => {
    options?.onConfirm?.();
    hideAlert();
  };

  const getIcon = () => {
    switch (options?.type) {
      case 'success': return { name: 'checkmark-circle', color: '#10b981' };
      case 'error': return { name: 'close-circle', color: '#ef4444' };
      case 'warning': return { name: 'warning', color: '#f59e0b' };
      default: return { name: 'information-circle', color: '#3b82f6' };
    }
  };

  const icon = getIcon();

  return (
    <CustomAlertContext.Provider value={{ showAlert }}>
      {children}
      <Modal transparent visible={visible} animationType="none">
        <View style={styles.overlay}>
          <Animated.View style={[styles.alertBox, { transform: [{ scale: scaleValue }] }]}>
            <View style={[styles.iconContainer, { backgroundColor: `${icon.color}15` }]}>
              <Ionicons name={icon.name as any} size={40} color={icon.color} />
            </View>
            
            <Text style={styles.title}>{options?.title}</Text>
            <Text style={styles.message}>{options?.message}</Text>
            
            <View style={styles.buttonContainer}>
              {options?.showCancel && (
                <TouchableOpacity style={styles.cancelButton} onPress={hideAlert}>
                  <Text style={styles.cancelButtonText}>{options?.cancelText || 'Batal'}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={[styles.confirmButton, { backgroundColor: icon.color }]} 
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>{options?.confirmText || 'OK'}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </CustomAlertContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertBox: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#1e293b',
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    color: '#64748b',
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    color: '#64748b',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
  },
});
