import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-chart-kit';
import * as Haptics from 'expo-haptics';
import { sleepApi } from '../../services/api';
import { SleepRecord } from '../../types';
import WellnessRing from '../../components/WellnessRing';
import { Colors, getScoreColor } from '../../constants/colors';

const { width } = Dimensions.get('window');

const SleepScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState(7);
  const [interruptions, setInterruptions] = useState('1');
  const [notes, setNotes] = useState('');

  // Tips accordion
  const [expandedTip, setExpandedTip] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await sleepApi.getSleepRecords(7);
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDuration = (): number => {
    const [bH, bM] = bedtime.split(':').map(Number);
    const [wH, wM] = wakeTime.split(':').map(Number);
    let diff = (wH * 60 + wM) - (bH * 60 + bM);
    if (diff < 0) diff += 24 * 60;
    return Math.round((diff / 60) * 10) / 10;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await sleepApi.logSleep({
        bedtime,
        wake_time: wakeTime,
        duration_hours: calculateDuration(),
        quality_score: quality * 10,
        interruptions: parseInt(interruptions) || 0,
        notes,
        date: new Date().toISOString().split('T')[0],
      });
      Alert.alert('Logged!', 'Your sleep record has been saved.', [
        { text: 'OK', onPress: loadData },
      ]);
      setBedtime('23:00');
      setWakeTime('07:00');
      setQuality(7);
      setNotes('');
    } catch (err) {
      Alert.alert('Error', 'Failed to log sleep. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const avgQuality = records.length
    ? Math.round(records.reduce((s, r) => s + r.quality_score, 0) / records.length)
    : 65;

  const avgDuration = records.length
    ? Math.round((records.reduce((s, r) => s + r.duration_hours, 0) / records.length) * 10) / 10
    : 6.5;

  const chartData = {
    labels: records.slice(-7).map((r) => {
      const d = new Date(r.date);
      return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d.getDay()];
    }),
    datasets: [{ data: records.slice(-7).map((r) => r.duration_hours) }],
  };

  const sleepTips = [
    {
      title: 'Consistent Sleep Schedule',
      content: 'Go to bed and wake up at the same time every day, even on weekends. This regulates your body\'s internal clock.',
    },
    {
      title: 'Limit Screen Time Before Bed',
      content: 'The blue light from screens suppresses melatonin production. Avoid screens 1-2 hours before sleep.',
    },
    {
      title: 'Create a Sleep-Friendly Environment',
      content: 'Keep your room cool (65-68°F), dark, and quiet. Use blackout curtains and white noise if needed.',
    },
    {
      title: 'Avoid Caffeine After 2 PM',
      content: 'Caffeine has a half-life of 5-7 hours. Having coffee after 2 PM can still be active in your system at bedtime.',
    },
    {
      title: 'Wind Down Routine',
      content: 'A 30-minute relaxation routine—reading, meditation, or light stretching—signals your body it\'s time to sleep.',
    },
  ];

  const chartConfig = {
    backgroundGradientFrom: Colors.surface,
    backgroundGradientTo: Colors.surface,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: () => Colors.textMuted,
    propsForBackgroundLines: { stroke: Colors.border },
    barPercentage: 0.7,
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#1e3a5f', Colors.background]}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Sleep Tracker</Text>
            <MaterialCommunityIcons name="moon-waning-crescent" size={24} color="#3b82f6" />
          </View>
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <WellnessRing score={avgQuality} label="Quality" size={80} />
            </View>
            <View style={styles.statsRight}>
              <View style={styles.statRow}>
                <MaterialCommunityIcons name="clock-outline" size={18} color="#3b82f6" />
                <View>
                  <Text style={styles.statValue}>{avgDuration}h</Text>
                  <Text style={styles.statLabel}>Avg Duration</Text>
                </View>
              </View>
              <View style={styles.statRow}>
                <MaterialCommunityIcons name="calendar-check" size={18} color={Colors.success} />
                <View>
                  <Text style={styles.statValue}>{records.length}</Text>
                  <Text style={styles.statLabel}>Days Tracked</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Weekly Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          {isLoading ? (
            <View style={[styles.chartPlaceholder]}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : (
            <View style={styles.chartCard}>
              <BarChart
                data={chartData}
                width={width - 48}
                height={180}
                chartConfig={chartConfig}
                style={styles.chart}
                yAxisLabel=""
                yAxisSuffix="h"
                fromZero
                showBarTops={false}
              />
            </View>
          )}
        </View>

        {/* Log Sleep Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Log Tonight's Sleep</Text>
          <View style={styles.formCard}>
            <View style={styles.timeRow}>
              <View style={styles.timeField}>
                <Text style={styles.fieldLabel}>Bedtime</Text>
                <View style={styles.timeInput}>
                  <MaterialCommunityIcons name="bed-clock" size={20} color={Colors.info} />
                  <TextInput
                    style={styles.timeText}
                    value={bedtime}
                    onChangeText={setBedtime}
                    placeholder="23:00"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              </View>
              <MaterialCommunityIcons name="arrow-right" size={20} color={Colors.textMuted} style={{ marginTop: 30 }} />
              <View style={styles.timeField}>
                <Text style={styles.fieldLabel}>Wake Time</Text>
                <View style={styles.timeInput}>
                  <MaterialCommunityIcons name="alarm" size={20} color={Colors.warning} />
                  <TextInput
                    style={styles.timeText}
                    value={wakeTime}
                    onChangeText={setWakeTime}
                    placeholder="07:00"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              </View>
            </View>

            {/* Duration preview */}
            <View style={styles.durationPreview}>
              <MaterialCommunityIcons name="timer-sand" size={16} color={Colors.primary} />
              <Text style={styles.durationText}>
                Sleep duration: {calculateDuration()} hours
              </Text>
            </View>

            {/* Quality Slider */}
            <View style={styles.qualitySection}>
              <Text style={styles.fieldLabel}>Sleep Quality: {quality}/10</Text>
              <View style={styles.qualitySlider}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((q) => (
                  <TouchableOpacity
                    key={q}
                    style={[
                      styles.qualityDot,
                      q <= quality && { backgroundColor: getScoreColor(q * 10) },
                    ]}
                    onPress={() => { setQuality(q); Haptics.selectionAsync(); }}
                  />
                ))}
              </View>
              <View style={styles.qualityLabels}>
                <Text style={styles.qualityLabel}>Poor</Text>
                <Text style={styles.qualityLabel}>Excellent</Text>
              </View>
            </View>

            {/* Interruptions */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Wake-ups during the night</Text>
              <View style={styles.inputRow}>
                {['0', '1', '2', '3', '4+'].map((v) => (
                  <TouchableOpacity
                    key={v}
                    style={[styles.countButton, interruptions === v && styles.countButtonActive]}
                    onPress={() => setInterruptions(v)}
                  >
                    <Text style={[styles.countButtonText, interruptions === v && styles.countButtonTextActive]}>
                      {v}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Notes (optional)</Text>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="How did you feel? Any dreams?"
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={styles.submitButtonWrapper}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#3b82f6', '#6366f1']} style={styles.submitButton}>
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
                    <Text style={styles.submitText}>Save Sleep Record</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sleep Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sleep Tips</Text>
          {sleepTips.map((tip, index) => (
            <TouchableOpacity
              key={index}
              style={styles.tipCard}
              onPress={() => {
                setExpandedTip(expandedTip === index ? null : index);
                Haptics.selectionAsync();
              }}
              activeOpacity={0.8}
            >
              <View style={styles.tipHeader}>
                <View style={styles.tipIconWrapper}>
                  <MaterialCommunityIcons name="lightbulb-on-outline" size={16} color={Colors.warning} />
                </View>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <MaterialCommunityIcons
                  name={expandedTip === index ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={Colors.textMuted}
                />
              </View>
              {expandedTip === index && (
                <Text style={styles.tipContent}>{tip.content}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20 },
  header: { borderRadius: 24, padding: 20, marginVertical: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },
  headerStats: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  statItem: {},
  statsRight: { flex: 1, gap: 12 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 12, color: Colors.textMuted },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  chartCard: { backgroundColor: Colors.surface, borderRadius: 20, padding: 12, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  chartPlaceholder: { height: 180, backgroundColor: Colors.surface, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  chart: { borderRadius: 12, marginLeft: -8 },
  formCard: { backgroundColor: Colors.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: Colors.border },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  timeField: { flex: 1 },
  fieldLabel: { fontSize: 13, color: Colors.textMuted, fontWeight: '600', marginBottom: 8 },
  timeInput: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.background, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.border },
  timeText: { flex: 1, color: Colors.text, fontSize: 16, fontWeight: '700' },
  durationPreview: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary + '11', padding: 10, borderRadius: 10, marginBottom: 16 },
  durationText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  qualitySection: { marginBottom: 16 },
  qualitySlider: { flexDirection: 'row', gap: 6, marginVertical: 8 },
  qualityDot: { flex: 1, height: 32, borderRadius: 8, backgroundColor: Colors.surfaceLight },
  qualityLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  qualityLabel: { fontSize: 11, color: Colors.textMuted },
  fieldContainer: { marginBottom: 16 },
  inputRow: { flexDirection: 'row', gap: 8 },
  countButton: { flex: 1, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  countButtonActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  countButtonText: { color: Colors.textMuted, fontWeight: '600' },
  countButtonTextActive: { color: '#fff' },
  notesInput: { backgroundColor: Colors.background, borderRadius: 12, padding: 12, color: Colors.text, borderWidth: 1, borderColor: Colors.border, minHeight: 80 },
  submitButtonWrapper: { borderRadius: 14, overflow: 'hidden', marginTop: 4 },
  submitButton: { height: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  tipCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tipIconWrapper: { width: 30, height: 30, borderRadius: 10, backgroundColor: Colors.warning + '22', justifyContent: 'center', alignItems: 'center' },
  tipTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.text },
  tipContent: { fontSize: 13, color: Colors.textMuted, lineHeight: 20, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border },
});

export default SleepScreen;
