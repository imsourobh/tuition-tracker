import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.subtitle}>Tuition Tracker App</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎓 Track Your Tuitions</Text>
          <Text style={styles.cardDescription}>
            Manage multiple tuitions, mark attendance, track streaks, and view your progress with an
            interactive calendar.
          </Text>
        </View>

        <View style={styles.features}>
          <Text style={styles.featuresTitle}>Features:</Text>
          <Text style={styles.featureItem}>✅ Track multiple tuitions</Text>
          <Text style={styles.featureItem}>📅 Interactive calendar view</Text>
          <Text style={styles.featureItem}>🔥 Streak counter</Text>
          <Text style={styles.featureItem}>📊 Attendance history</Text>
        </View>

        <Pressable style={styles.button} onPress={() => router.push('/(tabs)/tuition-tracker')}>
          <Text style={styles.buttonText}>Open Tuition Tracker</Text>
        </Pressable>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How to Use:</Text>
          <Text style={styles.infoText}>1. Navigate to the Tuition tab</Text>
          <Text style={styles.infoText}>2. Select a date from the calendar</Text>
          <Text style={styles.infoText}>3. Tap the checkmark to mark attendance</Text>
          <Text style={styles.infoText}>4. Watch your streak grow!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
    marginTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#aaa',
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  features: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  featureItem: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
  },
});
