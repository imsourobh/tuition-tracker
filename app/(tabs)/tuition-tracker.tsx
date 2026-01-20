import { Calendar } from '@/components/calendar';
import { TuitionCard } from '@/components/tuition-card';
import { TuitionSettingsModal } from '@/components/tuition-settings-modal';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface Tuition {
  id: string;
  name: string;
  color: string;
  icon: string;
  completedDates: { [key: string]: boolean };
  paymentStatus: boolean;
  lastPaidMonth: string;
  daysPerWeek: number;
}

const COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#FF8C42', '#6C63FF', '#FF006E', '#00D9FF'];
const ICONS = ['calculator', 'book', 'flask', 'globe', 'pencil', 'briefcase', 'star', 'heart'];
const STORAGE_KEY = '@tuition_tracker_v2';

const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const getDateKey = (date: Date) => {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

const getMonthlyLimit = (daysPerWeek: number) => daysPerWeek * 4;

const getCurrentMonthCount = (tuition: Tuition) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return Object.keys(tuition.completedDates).filter(dateKey => {
    const parts = dateKey.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    return year === currentYear && month === currentMonth;
  }).length;
};

const DEFAULT_TUITIONS: Tuition[] = [
  {
    id: '1',
    name: 'Math Tuition',
    color: '#FFD700',
    icon: 'calculator',
    completedDates: {},
    paymentStatus: false,
    lastPaidMonth: '',
    daysPerWeek: 3,
  },
  {
    id: '2',
    name: 'English Tuition',
    color: '#FF6B6B',
    icon: 'book',
    completedDates: {},
    paymentStatus: false,
    lastPaidMonth: '',
    daysPerWeek: 2,
  },
];

export default function TuitionTracker() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTuitionName, setNewTuitionName] = useState('');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedIconIndex, setSelectedIconIndex] = useState(0);
  const [selectedTuition, setSelectedTuition] = useState<Tuition | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedTuitionId, setSelectedTuitionId] = useState<string | null>(null);

  // Load data from storage
  useEffect(() => {
    loadTuitions();
    requestNotificationPermissions();
  }, []);

  // Check for new month and reset payment status + schedule notifications
  useEffect(() => {
    if (!isLoading && tuitions.length > 0) {
      const currentMonth = getCurrentMonthKey();
      let needsUpdate = false;

      const updatedTuitions = tuitions.map((tuition) => {
        if (tuition.lastPaidMonth !== currentMonth && tuition.paymentStatus) {
          needsUpdate = true;
          return { ...tuition, paymentStatus: false };
        }
        return tuition;
      });

      if (needsUpdate) {
        setTuitions(updatedTuitions);
        saveTuitions(updatedTuitions);
        schedulePaymentReminders(updatedTuitions);
      } else {
        // Check if we need to schedule reminders for unpaid tuitions
        const hasUnpaid = tuitions.some(t => !t.paymentStatus);
        if (hasUnpaid) {
          schedulePaymentReminders(tuitions);
        }
      }
    }
  }, [isLoading]);

  const loadTuitions = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const migrated = parsed.map((t: any) => ({
          ...t,
          paymentStatus: t.paymentStatus ?? false,
          lastPaidMonth: t.lastPaidMonth ?? '',
          daysPerWeek: t.daysPerWeek ?? t.weeklySchedule?.length ?? 2,
        }));
        setTuitions(migrated);
      } else {
        setTuitions(DEFAULT_TUITIONS);
        await saveTuitions(DEFAULT_TUITIONS);
      }
    } catch (error) {
      console.error('Error loading tuitions:', error);
      setTuitions(DEFAULT_TUITIONS);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTuitions = async (data: Tuition[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving tuitions:', error);
    }
  };

  const requestNotificationPermissions = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('payment-reminders', {
        name: 'Payment Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
    }
  };

  const schedulePaymentReminders = async (tuitionList: Tuition[]) => {
    // Notifications not supported on web
    if (Platform.OS === 'web') return;

    await Notifications.cancelAllScheduledNotificationsAsync();

    const unpaidTuitions = tuitionList.filter((t) => !t.paymentStatus);
    if (unpaidTuitions.length === 0) return;

    const now = new Date();
    const currentDay = now.getDate();

    for (const tuition of unpaidTuitions) {
      if (currentDay <= 1) {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1, 9, 0, 0);
        if (firstDay > now) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '💰 Payment Reminder',
              body: `New month started! Don't forget to mark payment for ${tuition.name}.`,
            },
            trigger: { type: SchedulableTriggerInputTypes.DATE, date: firstDay },
          });
        }
      }

      if (currentDay <= 2) {
        const secondDay = new Date(now.getFullYear(), now.getMonth(), 2, 9, 0, 0);
        if (secondDay > now) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '💰 Payment Reminder',
              body: `New month started! Don't forget to mark payment for ${tuition.name}.`,
            },
            trigger: { type: SchedulableTriggerInputTypes.DATE, date: secondDay },
          });
        }
      }
    }
  };

  // Toggle attendance with auto-reset logic
  const toggleTuition = useCallback((tuitionId: string) => {
    const dateKey = getDateKey(selectedDate);

    setTuitions(prev => {
      const newTuitions = prev.map((tuition) => {
        if (tuition.id === tuitionId) {
          const newCompletedDates = { ...tuition.completedDates };

          if (newCompletedDates[dateKey]) {
            // Already checked, uncheck it
            delete newCompletedDates[dateKey];
          } else {
            // Check: apply auto-reset logic
            const currentCount = getCurrentMonthCount(tuition);
            const limit = getMonthlyLimit(tuition.daysPerWeek);

            if (currentCount + 1 > limit) {
              // Reset: clear all dates for current month and add this one
              const now = new Date();
              const currentMonth = now.getMonth();
              const currentYear = now.getFullYear();

              Object.keys(newCompletedDates).forEach(key => {
                const parts = key.split('-');
                if (parseInt(parts[0]) === currentYear && parseInt(parts[1]) === currentMonth) {
                  delete newCompletedDates[key];
                }
              });
            }

            newCompletedDates[dateKey] = true;
          }

          return { ...tuition, completedDates: newCompletedDates };
        }
        return tuition;
      });

      // Persist immediately
      saveTuitions(newTuitions);
      return newTuitions;
    });
  }, [selectedDate]);

  const togglePaymentStatus = useCallback((tuitionId: string) => {
    const currentMonth = getCurrentMonthKey();

    setTuitions(prev => {
      const updated = prev.map((tuition) => {
        if (tuition.id === tuitionId) {
          const newStatus = !tuition.paymentStatus;
          return {
            ...tuition,
            paymentStatus: newStatus,
            lastPaidMonth: newStatus ? currentMonth : tuition.lastPaidMonth,
          };
        }
        return tuition;
      });

      const updatedTuition = updated.find((t) => t.id === tuitionId);
      if (updatedTuition) {
        setSelectedTuition(updatedTuition);
      }

      const hasUnpaid = updated.some((t) => !t.paymentStatus);
      if (!hasUnpaid) {
        Notifications.cancelAllScheduledNotificationsAsync();
      } else {
        schedulePaymentReminders(updated);
      }

      saveTuitions(updated);
      return updated;
    });
  }, []);

  const updateDaysPerWeek = useCallback((tuitionId: string, days: number) => {
    setTuitions(prev => {
      const updated = prev.map((tuition) => {
        if (tuition.id === tuitionId) {
          return { ...tuition, daysPerWeek: days };
        }
        return tuition;
      });

      const updatedTuition = updated.find((t) => t.id === tuitionId);
      if (updatedTuition) {
        setSelectedTuition(updatedTuition);
      }

      saveTuitions(updated);
      return updated;
    });
  }, []);

  const isCheckedOnDate = (tuitionId: string) => {
    const dateKey = getDateKey(selectedDate);
    const tuition = tuitions.find((t) => t.id === tuitionId);
    return tuition?.completedDates[dateKey] || false;
  };

  const addTuition = () => {
    if (!newTuitionName.trim()) {
      Alert.alert('Error', 'Please enter a tuition name');
      return;
    }

    const newTuition: Tuition = {
      id: Date.now().toString(),
      name: newTuitionName,
      color: COLORS[selectedColorIndex],
      icon: ICONS[selectedIconIndex],
      completedDates: {},
      paymentStatus: false,
      lastPaidMonth: '',
      daysPerWeek: 2,
    };

    const newTuitions = [...tuitions, newTuition];
    setTuitions(newTuitions);
    saveTuitions(newTuitions);

    setNewTuitionName('');
    setSelectedColorIndex(0);
    setSelectedIconIndex(0);
    setShowAddModal(false);
    Alert.alert('Success', `${newTuitionName} added successfully!`);
  };

  // Fixed delete with immediate persistence
  const removeTuition = useCallback((tuitionId: string) => {
    setTuitions(prev => {
      const filtered = prev.filter((t) => t.id !== tuitionId);
      saveTuitions(filtered);
      return filtered;
    });

    if (selectedTuitionId === tuitionId) {
      setSelectedTuitionId(null);
    }
  }, [selectedTuitionId]);

  const openSettings = (tuition: Tuition) => {
    setSelectedTuition(tuition);
    setShowSettingsModal(true);
  };

  const handleNamePress = (tuitionId: string) => {
    if (selectedTuitionId === tuitionId) {
      setSelectedTuitionId(null);
    } else {
      setSelectedTuitionId(tuitionId);
    }
  };

  // Calculate marked dates for calendar with glow effect
  const markedDates = useMemo(() => {
    const marks: { [key: string]: { color: string; isGlowing?: boolean }[] } = {};

    tuitions.forEach(tuition => {
      Object.keys(tuition.completedDates).forEach(dateKey => {
        if (!marks[dateKey]) {
          marks[dateKey] = [];
        }

        const isGlowing = selectedTuitionId === null || selectedTuitionId === tuition.id;

        if (selectedTuitionId === null || selectedTuitionId === tuition.id) {
          marks[dateKey].push({
            color: tuition.color,
            isGlowing: selectedTuitionId === tuition.id,
          });
        }
      });
    });

    return marks;
  }, [tuitions, selectedTuitionId]);

  const selectedTuitionForModal = useMemo(() => {
    if (!selectedTuition) return null;
    const current = tuitions.find(t => t.id === selectedTuition.id);
    if (!current) return null;

    return {
      ...current,
      monthlyLimit: getMonthlyLimit(current.daysPerWeek),
      currentMonthCount: getCurrentMonthCount(current),
    };
  }, [selectedTuition, tuitions]);

  const dateString = selectedDate.toLocaleString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const isToday =
    selectedDate.getDate() === new Date().getDate() &&
    selectedDate.getMonth() === new Date().getMonth() &&
    selectedDate.getFullYear() === new Date().getFullYear();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{isToday ? 'Today' : dateString}</Text>
            {selectedTuitionId && (
              <Pressable onPress={() => setSelectedTuitionId(null)}>
                <Text style={styles.filterHint}>
                  Filtering: {tuitions.find(t => t.id === selectedTuitionId)?.name} (tap to clear)
                </Text>
              </Pressable>
            )}
          </View>
          <View style={styles.headerIcons}>
            <Pressable style={styles.iconButton} onPress={() => setShowAddModal(true)}>
              <Ionicons name="add" size={24} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Calendar */}
        <Calendar
          onDateSelect={setSelectedDate}
          selectedDate={selectedDate}
          calendarMonth={calendarMonth}
          onMonthChange={setCalendarMonth}
          markedDates={markedDates}
          selectedTuitionColor={selectedTuitionId ? tuitions.find(t => t.id === selectedTuitionId)?.color : undefined}
        />

        {/* Tuition List */}
        <View style={styles.tuitionSection}>
          {tuitions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={48} color="#666" />
              <Text style={styles.emptyText}>No tuitions yet</Text>
              <Text style={styles.emptySubtext}>Tap + to add your first tuition</Text>
            </View>
          ) : (
            tuitions.map((tuition) => (
              <TuitionCard
                key={tuition.id}
                id={tuition.id}
                name={tuition.name}
                color={tuition.color}
                currentCount={getCurrentMonthCount(tuition)}
                monthlyLimit={getMonthlyLimit(tuition.daysPerWeek)}
                icon={tuition.icon}
                isChecked={isCheckedOnDate(tuition.id)}
                paymentStatus={tuition.paymentStatus}
                isSelected={selectedTuitionId === tuition.id}
                onToggle={() => toggleTuition(tuition.id)}
                onPress={() => openSettings(tuition)}
                onNamePress={() => handleNamePress(tuition.id)}
              />
            ))
          )}
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Settings Modal */}
      <TuitionSettingsModal
        visible={showSettingsModal}
        tuition={selectedTuitionForModal}
        onClose={() => setShowSettingsModal(false)}
        onTogglePayment={togglePaymentStatus}
        onUpdateDaysPerWeek={updateDaysPerWeek}
        onDelete={removeTuition}
      />

      {/* Add Tuition Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Tuition</Text>
              <Pressable onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </Pressable>
            </View>

            <ScrollView>
              <Text style={styles.label}>Tuition Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter tuition name"
                placeholderTextColor="#666"
                value={newTuitionName}
                onChangeText={setNewTuitionName}
              />

              <Text style={styles.label}>Color</Text>
              <View style={styles.colorGrid}>
                {COLORS.map((color, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColorIndex === index && styles.colorSelected,
                    ]}
                    onPress={() => setSelectedColorIndex(index)}
                  >
                    {selectedColorIndex === index && (
                      <Ionicons name="checkmark" size={20} color="#000" />
                    )}
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Icon</Text>
              <View style={styles.iconGrid}>
                {ICONS.map((icon, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.iconOption,
                      selectedIconIndex === index && styles.iconSelected,
                    ]}
                    onPress={() => setSelectedIconIndex(index)}
                  >
                    <Ionicons name={icon as any} size={28} color={COLORS[selectedColorIndex]} />
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Pressable style={styles.addButton} onPress={addTuition}>
              <Text style={styles.addButtonText}>Add Tuition</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterHint: {
    fontSize: 12,
    color: '#FFD700',
    marginTop: 4,
  },
  headerIcons: {
    position: 'absolute',
    right: 16,
    top: 16,
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tuitionSection: {
    marginVertical: 8,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  spacer: {
    height: 32,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#333',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: 50,
    height: 50,
    backgroundColor: '#1a1a1a',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  iconSelected: {
    borderColor: '#007AFF',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
