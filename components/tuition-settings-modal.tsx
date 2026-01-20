import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

interface TuitionSettingsModalProps {
    visible: boolean;
    tuition: {
        id: string;
        name: string;
        color: string;
        icon: string;
        paymentStatus: boolean;
        daysPerWeek: number;
        monthlyLimit: number;
        currentMonthCount: number;
    } | null;
    onClose: () => void;
    onTogglePayment: (id: string) => void;
    onUpdateDaysPerWeek: (id: string, days: number) => void;
    onDelete: (id: string) => void;
}

export const TuitionSettingsModal: React.FC<TuitionSettingsModalProps> = ({
    visible,
    tuition,
    onClose,
    onTogglePayment,
    onUpdateDaysPerWeek,
    onDelete,
}) => {
    if (!tuition) return null;

    const handleDelete = () => {
        if (Platform.OS === 'web') {
            const confirmed = window.confirm(`Are you sure you want to delete "${tuition.name}"? This action cannot be undone.`);
            if (confirmed) {
                onDelete(tuition.id);
                onClose();
            }
        } else {
            Alert.alert(
                'Delete Tuition',
                `Are you sure you want to delete "${tuition.name}"? This action cannot be undone.`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => {
                            onDelete(tuition.id);
                            onClose();
                        },
                    },
                ]
            );
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <View style={[styles.iconCircle, { backgroundColor: tuition.color + '30' }]}>
                                <Ionicons name={tuition.icon as any} size={24} color={tuition.color} />
                            </View>
                            <Text style={styles.title}>{tuition.name}</Text>
                        </View>
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Progress Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Monthly Progress</Text>
                            <View style={styles.progressContainer}>
                                <View style={styles.progressBar}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            {
                                                backgroundColor: tuition.color,
                                                width: `${Math.min(100, (tuition.currentMonthCount / tuition.monthlyLimit) * 100)}%`
                                            }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.progressText}>
                                    {tuition.currentMonthCount} / {tuition.monthlyLimit} sessions
                                </Text>
                            </View>
                        </View>

                        {/* Days Per Week */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Days Per Week</Text>
                            <Text style={styles.sectionSubtitle}>
                                Monthly limit auto-calculates as days × 4
                            </Text>
                            <View style={styles.daysSelector}>
                                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                                    <Pressable
                                        key={day}
                                        style={[
                                            styles.dayOption,
                                            tuition.daysPerWeek === day && { backgroundColor: tuition.color },
                                        ]}
                                        onPress={() => onUpdateDaysPerWeek(tuition.id, day)}
                                    >
                                        <Text style={[
                                            styles.dayOptionText,
                                            tuition.daysPerWeek === day && styles.dayOptionTextSelected,
                                        ]}>
                                            {day}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                            <Text style={styles.limitInfo}>
                                Monthly Limit: {tuition.daysPerWeek * 4} sessions
                            </Text>
                        </View>

                        {/* Payment Status */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Payment Status</Text>
                            <View style={styles.paymentRow}>
                                <View style={styles.paymentInfo}>
                                    <View
                                        style={[
                                            styles.paymentIndicator,
                                            { backgroundColor: tuition.paymentStatus ? '#4CAF50' : '#FF6B6B' },
                                        ]}
                                    />
                                    <Text style={styles.paymentText}>
                                        {tuition.paymentStatus ? 'Paid for this month' : 'Payment pending'}
                                    </Text>
                                </View>
                                <Switch
                                    value={tuition.paymentStatus}
                                    onValueChange={() => onTogglePayment(tuition.id)}
                                    trackColor={{ false: '#3a3a3a', true: '#4CAF50' }}
                                    thumbColor={tuition.paymentStatus ? '#fff' : '#888'}
                                />
                            </View>
                            {!tuition.paymentStatus && (
                                <Pressable
                                    style={[styles.markPaidButton, { backgroundColor: tuition.color }]}
                                    onPress={() => onTogglePayment(tuition.id)}
                                >
                                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                    <Text style={styles.markPaidText}>Mark as Paid</Text>
                                </Pressable>
                            )}
                        </View>

                        {/* Danger Zone */}
                        <View style={styles.dangerSection}>
                            <Text style={styles.dangerTitle}>Danger Zone</Text>
                            <Pressable style={styles.deleteButton} onPress={handleDelete}>
                                <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                                <Text style={styles.deleteText}>Delete Tuition</Text>
                            </Pressable>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
    },
    closeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    section: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 12,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#888',
        marginBottom: 12,
    },
    progressContainer: {
        gap: 8,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#2a2a2a',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        color: '#ccc',
        textAlign: 'center',
    },
    daysSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    dayOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayOptionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#888',
    },
    dayOptionTextSelected: {
        color: '#fff',
    },
    limitInfo: {
        fontSize: 14,
        color: '#4CAF50',
        textAlign: 'center',
        fontWeight: '500',
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    paymentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 10,
    },
    paymentText: {
        fontSize: 14,
        color: '#ccc',
    },
    markPaidButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    markPaidText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    dangerSection: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 16,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#3a2020',
    },
    dangerTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF6B6B',
        marginBottom: 12,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a1a1a',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    deleteText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF6B6B',
        marginLeft: 10,
    },
});
