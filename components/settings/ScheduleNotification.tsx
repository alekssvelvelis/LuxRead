import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TextInput, TouchableRipple } from 'react-native-paper';
import { useThemeContext } from '@/contexts/ThemeContext';
import ModalComponent from '../ModalComponent';
import { getUserReminder, saveUserReminder, removeItem } from '@/utils/asyncStorage';

interface UserReminder {
  message: string,
  hour: number,
  minute: number,
  id?: string
}

const ScheduleNotification = () => {
  const { appliedTheme } = useThemeContext();
  const [time, setTime] = useState(new Date());
  const [message, setMessage] = useState(`📝 Don't forget to read!`);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [localUserReminder, setLocalUserReminder] = useState<UserReminder>({
    message: '',
    hour: new Date().getHours(),
    minute: new Date().getMinutes(),
    id: '',
  });

  const toggleDatePicker = () => setPickerVisible(!isPickerVisible);

  const onChangeTime = (_event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTime(selectedDate);
    }
    setPickerVisible(false);
  };

  const checkPermissions = async () => {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Permission for notifications not granted.');
      }
    } else {
      alert('Must use physical device for Push Notifications');
    }
  }

  useEffect(() => {
      const loadUserReminder = async () => {
        try {
          const userReminder = await getUserReminder();
          if (userReminder) {
            const { message, hour, minute } = JSON.parse(userReminder);
            setLocalUserReminder({
              message: message || '',
              hour: hour || 0,
              minute: minute || 0,
            });
          }
        } catch (error) {
          console.error('Error loading reader options', error);
        }
      };
  
      loadUserReminder();
    }, []);

  useEffect(() => {
    const logScheduledNotifications = async () => {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log('Scheduled notifications on mount:', scheduled);
    };
    logScheduledNotifications();

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    checkPermissions();
  }, [])

  const handleSchedule = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      const trigger: Notifications.NotificationTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.DAILY, 
        hour: time.getHours(),
        minute: time.getMinutes(),
      }

      const recurringReminderId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'LuxRead',
          body: message,
        },
        trigger,
      });

      const settingsToSave = {
        message: message,
        hour: time.getHours(),
        minute: time.getMinutes(),
        id: recurringReminderId
      }

      await saveUserReminder(settingsToSave);
      setLocalUserReminder(settingsToSave);
      
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log('Scheduled notifications inside of handleSchedule:', scheduled);
      
      setModalVisible(true);
      setModalContent(
        <View style={{ width: 320, backgroundColor: appliedTheme.colors.surfaceVariant, padding: 12, borderRadius: 8 }}>
          <Text style={{color: appliedTheme.colors.text, fontSize: 22, marginBottom: 12}}>Success</Text>
          <Text style={{color: appliedTheme.colors.text}}>Reminder scheduled for {time.getHours()}:{time.getMinutes().toString().padStart(2, '0')} daily</Text>
          <View style={{width: '100%', display: 'flex', alignItems: 'flex-end'}}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: appliedTheme.colors.primary, width: '20%', padding: 8 }]}
              onPress={handleModalClose}
            >
              <Text style={{color: appliedTheme.colors.text}}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Could not schedule reminder');
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleCancel = async () => {
    setModalVisible(true);
    if (localUserReminder.id) {
      // await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.cancelScheduledNotificationAsync(localUserReminder.id);
      await removeItem('userReminder');
      setModalContent(
        <View style={{ width: 320, backgroundColor: appliedTheme.colors.surfaceVariant, padding: 12, borderRadius: 12 }}>
          <Text style={{color: appliedTheme.colors.text, fontSize: 22, marginBottom: 12}}>Cancelled</Text>
          <Text style={{color: appliedTheme.colors.text}}>Reminder has been cancelled</Text>
          <View style={{width: '100%', display: 'flex', alignItems: 'flex-end'}}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: appliedTheme.colors.primary, width: '20%', padding: 8 }]}
              onPress={handleModalClose}
            >
              <Text style={{color: appliedTheme.colors.text}}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
      setLocalUserReminder({
        message: '',
        hour: new Date().getHours(),
        minute: new Date().getMinutes(),
      });
      return;
    } 
    setModalContent(
      <View style={{ width: 320, backgroundColor: appliedTheme.colors.surfaceVariant, padding: 12, borderRadius: 12 }}>
        <Text style={{color: appliedTheme.colors.text, fontSize: 22, marginBottom: 12}}>Nothing to cancel</Text>
        <Text style={{color: appliedTheme.colors.text}}>No active reminders found.</Text>
        <View style={{width: '100%', display: 'flex', alignItems: 'flex-end'}}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: appliedTheme.colors.primary, width: '20%', padding: 8 }]}
            onPress={handleModalClose}
          >
            <Text style={{color: appliedTheme.colors.text}}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };  

  return (
    <View style={[styles.container, { backgroundColor: appliedTheme.colors.elevation.level2 }]}>
      <TextInput
        mode="outlined"
        value={message}
        onChangeText={setMessage}
        placeholderTextColor={appliedTheme.colors.outline}
        numberOfLines={1}
        textColor={appliedTheme.colors.text}
        style={[styles.input, { backgroundColor: appliedTheme.colors.elevation.level4, color: appliedTheme.colors.text }]}
        right={
          <TextInput.Icon
            icon={() => (
              <MaterialCommunityIcons name="clock-outline" size={22} color={appliedTheme.colors.primary} />
            )}
            onPress={toggleDatePicker}
            forceTextInputFocus={false}
          />
        }
      />

      {localUserReminder.message !== '' && (
        <View style={{ marginVertical: 12 }}>
          <Text style={{ color: appliedTheme.colors.text }}>
            Current Reminder: {localUserReminder.message} at {localUserReminder.hour}:{localUserReminder.minute.toString().padStart(2, '0')}
          </Text>
        </View>
      )}

      {isPickerVisible && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          accentColor={appliedTheme.colors.primary}
          onChange={onChangeTime}
        />
      )}

      <TouchableRipple
        style={[styles.button, { backgroundColor: appliedTheme.colors.primary }]}
        onPress={handleSchedule}
      >
        <Text style={{ color: appliedTheme.colors.text }}>Schedule Daily Reminder</Text>
      </TouchableRipple>

      <TouchableRipple
        style={[styles.button, { backgroundColor: '#d9534f' }]}
        onPress={handleCancel}
      >
        <Text style={{ color: 'white' }}>Cancel Reminder</Text>
      </TouchableRipple>
        {modalVisible && (
          <ModalComponent visible={modalVisible} onClose={handleModalClose}>
            {modalContent}
          </ModalComponent>
        )}
    </View>
  );
}

export default ScheduleNotification;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    marginVertical: 12,
  },
  button: {
    marginTop: 10,
    padding: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
  }
});