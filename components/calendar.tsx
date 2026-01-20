import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface MarkedDate {
  color: string;
  isGlowing?: boolean;
}

interface CalendarProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
  calendarMonth: Date;
  onMonthChange: (date: Date) => void;
  markedDates: { [key: string]: MarkedDate[] };
  selectedTuitionColor?: string;
}

export const Calendar: React.FC<CalendarProps> = ({
  onDateSelect,
  selectedDate,
  calendarMonth,
  onMonthChange,
  markedDates,
  selectedTuitionColor,
}) => {
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(calendarMonth);
  const firstDay = getFirstDayOfMonth(calendarMonth);

  const days = useMemo(() => {
    const result: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
      result.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      result.push(i);
    }
    return result;
  }, [firstDay, daysInMonth]);

  const handleDateClick = (day: number) => {
    const newDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    onDateSelect(newDate);
  };

  const handlePrevMonth = () => {
    const newDate = new Date(calendarMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(calendarMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    onMonthChange(new Date(today.getFullYear(), today.getMonth(), 1));
    onDateSelect(today);
  };

  const monthYear = calendarMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <View style={styles.container}>
      <View style={styles.monthHeader}>
        <Pressable onPress={handlePrevMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.monthYear}>{monthYear}</Text>
        <Pressable onPress={handleNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </Pressable>
      </View>

      <Pressable onPress={handleToday} style={styles.todayButton}>
        <Text style={styles.todayButtonText}>Today</Text>
      </Pressable>

      <View style={styles.weekDays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Text key={day} style={styles.weekDay}>
            {day}
          </Text>
        ))}
      </View>
      <View style={styles.daysGrid}>
        {days.map((day, index) => {
          const dateKey = day
            ? `${calendarMonth.getFullYear()}-${calendarMonth.getMonth()}-${day}`
            : '';
          const marks = day ? markedDates[dateKey] || [] : [];
          const hasMarks = marks.length > 0;
          const isGlowing = marks.some(m => m.isGlowing);
          const isSelected =
            day === selectedDate.getDate() &&
            selectedDate.getMonth() === calendarMonth.getMonth() &&
            selectedDate.getFullYear() === calendarMonth.getFullYear();

          return (
            <Pressable
              key={index}
              style={[
                styles.day,
                day === null && styles.emptyDay,
                isSelected && styles.selectedDay,
                isGlowing && styles.glowingDay,
              ]}
              onPress={() => day !== null && handleDateClick(day)}
            >
              {day !== null && (
                <>
                  <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
                    {day}
                  </Text>
                  {hasMarks && (
                    <View style={styles.dotsContainer}>
                      {marks.slice(0, 4).map((mark, i) => (
                        <View
                          key={i}
                          style={[
                            styles.dot,
                            { backgroundColor: mark.color },
                            mark.isGlowing && styles.glowingDot,
                          ]}
                        />
                      ))}
                    </View>
                  )}
                </>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    marginHorizontal: 16,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthYear: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  todayButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'center',
    marginBottom: 12,
  },
  todayButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekDay: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  day: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
  },
  emptyDay: {
    backgroundColor: 'transparent',
  },
  selectedDay: {
    backgroundColor: '#FFD700',
  },
  selectedDayText: {
    color: '#000',
    fontWeight: 'bold',
  },
  glowingDay: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  dayText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  dotsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 4,
    gap: 2,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  glowingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
});
