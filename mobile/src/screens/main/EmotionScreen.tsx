import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { emotionApi } from '../../services/api';
import { EmotionRecord } from '../../types';
import EmotionBar from '../../components/EmotionBar';
import { Colors } from '../../constants/colors';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');

type TabType = 'camera' | 'manual' | 'history';

const EMOTION_EMOJIS = [
  { emoji: '😊', label: 'Happy', value: 'Happy' },
  { emoji: '😢', label: 'Sad', value: 'Sad' },
  { emoji: '😡', label: 'Angry', value: 'Angry' },
  { emoji: '😐', label: 'Neutral', value: 'Neutral' },
  { emoji: '😲', label: 'Surprised', value: 'Surprised' },
  { emoji: '😰', label: 'Anxious', value: 'Anxious' },
];

const EmotionScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('camera');
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<EmotionRecord | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [stressLevel, setStressLevel] = useState(5);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<EmotionRecord[]>([]);
  const cameraRef = useRef<CameraView>(null);

  const scanAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (activeTab === 'camera' && permission?.granted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(scanAnim, { toValue: 0, duration: 100, useNativeDriver: false }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [activeTab, permission?.granted]);

  const loadHistory = async () => {
    try {
      const data = await emotionApi.getEmotionRecords(7);
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnalyze = async () => {
    if (!cameraRef.current) return;
    setIsAnalyzing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // In real implementation, take a photo and send to API
      // For demo, simulate analysis
      await new Promise((r) => setTimeout(r, 2000));
      const result = await emotionApi.analyzeCamera('mock_base64_image');
      setAnalysisResult(result);
    } catch (err) {
      Alert.alert('Analysis Failed', 'Could not analyze emotion. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!selectedEmotion) {
      Alert.alert('Select Emotion', 'Please select an emotion first.');
      return;
    }
    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await emotionApi.logEmotion({
        dominant_emotion: selectedEmotion,
        stress_level: stressLevel * 10,
        source: 'manual',
        notes,
        emotions: [{ emotion: selectedEmotion, confidence: 1.0 }],
        confidence: 1.0,
        valence: 0.5,
        arousal: 0.5,
      });
      Alert.alert('Logged!', 'Your emotion has been recorded.', [{ text: 'OK', onPress: loadHistory }]);
      setSelectedEmotion('');
      setNotes('');
      setStressLevel(5);
    } catch (err) {
      Alert.alert('Error', 'Failed to log emotion. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scanY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'camera', label: 'Camera', icon: 'camera-outline' },
    { key: 'manual', label: 'Manual', icon: 'pencil-outline' },
    { key: 'history', label: 'History', icon: 'history' },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={['#4c1d95', Colors.background]} style={styles.header}>
        <Text style={styles.headerTitle}>Emotion Check</Text>
        <Text style={styles.headerSubtitle}>Monitor your emotional wellness</Text>
      </LinearGradient>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => {
              setActiveTab(tab.key);
              Haptics.selectionAsync();
            }}
          >
            <MaterialCommunityIcons
              name={tab.icon as any}
              size={18}
              color={activeTab === tab.key ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 'camera' && (
        <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
          {!permission ? (
            <View style={styles.permissionPlaceholder}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : !permission.granted ? (
            <View style={styles.permissionCard}>
              <MaterialCommunityIcons name="camera-off" size={60} color={Colors.textMuted} />
              <Text style={styles.permissionTitle}>Camera Access Required</Text>
              <Text style={styles.permissionText}>
                We need camera access to analyze your facial expressions and detect emotional state.
              </Text>
              <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.permissionButtonGrad}>
                  <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.manualFallback}
                onPress={() => setActiveTab('manual')}
              >
                <Text style={styles.manualFallbackText}>Or log manually →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Camera View */}
              <View style={styles.cameraContainer}>
                <CameraView ref={cameraRef} style={styles.camera} facing="front">
                  {/* Face overlay */}
                  <View style={styles.faceOverlay}>
                    <View style={styles.faceFrame}>
                      {/* Corner markers */}
                      <View style={[styles.corner, styles.topLeft]} />
                      <View style={[styles.corner, styles.topRight]} />
                      <View style={[styles.corner, styles.bottomLeft]} />
                      <View style={[styles.corner, styles.bottomRight]} />

                      {/* Scanning line */}
                      <Animated.View
                        style={[styles.scanLine, { transform: [{ translateY: scanY }] }]}
                      />
                    </View>
                  </View>

                  {/* Status overlay */}
                  <View style={styles.cameraStatus}>
                    <Animated.View
                      style={[styles.statusDot, { transform: [{ scale: pulseAnim }] }]}
                    />
                    <Text style={styles.statusText}>
                      {isAnalyzing ? 'Analyzing...' : 'Position your face in the frame'}
                    </Text>
                  </View>
                </CameraView>
              </View>

              {/* Analyze Button */}
              <TouchableOpacity
                style={styles.analyzeButtonWrapper}
                onPress={handleAnalyze}
                disabled={isAnalyzing}
                activeOpacity={0.85}
              >
                <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.analyzeButton}>
                  {isAnalyzing ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="face-recognition" size={22} color="#fff" />
                      <Text style={styles.analyzeButtonText}>Analyze Emotion</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Results */}
              {analysisResult && (
                <View style={styles.resultsCard}>
                  <Text style={styles.resultsTitle}>Detected Emotion</Text>
                  <View style={styles.dominantEmotion}>
                    <Text style={styles.dominantEmoji}>
                      {EMOTION_EMOJIS.find((e) => e.value === analysisResult.dominant_emotion)?.emoji || '😐'}
                    </Text>
                    <View>
                      <Text style={styles.dominantLabel}>{analysisResult.dominant_emotion}</Text>
                      <Text style={styles.dominantConfidence}>
                        {Math.round(analysisResult.confidence * 100)}% confidence
                      </Text>
                    </View>
                  </View>
                  <View style={styles.emotionBars}>
                    {analysisResult.emotions.slice(0, 4).map((e, i) => (
                      <EmotionBar key={i} emotion={e.emotion} confidence={e.confidence} isTop={i === 0} />
                    ))}
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}

      {activeTab === 'manual' && (
        <ScrollView contentContainerStyle={styles.tabContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.manualTitle}>How are you feeling?</Text>

          {/* Emoji Grid */}
          <View style={styles.emojiGrid}>
            {EMOTION_EMOJIS.map((e) => (
              <TouchableOpacity
                key={e.value}
                style={[
                  styles.emojiButton,
                  selectedEmotion === e.value && styles.emojiButtonActive,
                ]}
                onPress={() => {
                  setSelectedEmotion(e.value);
                  Haptics.selectionAsync();
                }}
              >
                <Text style={styles.emojiButtonEmoji}>{e.emoji}</Text>
                <Text style={[
                  styles.emojiButtonLabel,
                  selectedEmotion === e.value && styles.emojiButtonLabelActive,
                ]}>
                  {e.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Stress Level */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stress Level: {stressLevel}/10</Text>
            <View style={styles.stressSlider}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => {
                const colors = ['#22c55e', '#22c55e', '#22c55e', '#f59e0b', '#f59e0b', '#f59e0b', '#f97316', '#f97316', '#ef4444', '#ef4444'];
                return (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.stressDot,
                      { backgroundColor: level <= stressLevel ? colors[level - 1] : Colors.surfaceLight },
                    ]}
                    onPress={() => { setStressLevel(level); Haptics.selectionAsync(); }}
                  />
                );
              })}
            </View>
            <View style={styles.stressLabels}>
              <Text style={styles.stressLabel}>Low</Text>
              <Text style={styles.stressLabel}>Extreme</Text>
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Note (optional)</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="What's on your mind? Describe your day..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={styles.submitButtonWrapper}
            onPress={handleManualSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <LinearGradient colors={['#8b5cf6', '#6366f1']} style={styles.submitButton}>
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="heart-check" size={20} color="#fff" />
                  <Text style={styles.submitText}>Save Emotion Log</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      )}

      {activeTab === 'history' && (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.tabContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="emoticon-outline" size={60} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No emotion records yet</Text>
              <Text style={styles.emptySubtext}>Start by logging your current emotion</Text>
            </View>
          }
          renderItem={({ item }) => {
            const emoji = EMOTION_EMOJIS.find((e) => e.value === item.dominant_emotion)?.emoji || '😐';
            return (
              <View style={styles.historyCard}>
                <View style={styles.historyEmoji}>
                  <Text style={styles.historyEmojiText}>{emoji}</Text>
                </View>
                <View style={styles.historyContent}>
                  <Text style={styles.historyEmotion}>{item.dominant_emotion}</Text>
                  <Text style={styles.historyMeta}>
                    {format(new Date(item.timestamp), 'MMM d, h:mm a')} • {item.source}
                  </Text>
                  <Text style={styles.historyConfidence}>
                    {Math.round(item.confidence * 100)}% confidence
                  </Text>
                </View>
                <View style={styles.historyStress}>
                  <Text style={styles.historyStressLabel}>Stress</Text>
                  <Text style={styles.historyStressValue}>{item.stress_level}%</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingVertical: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.text },
  headerSubtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
  tabBar: { flexDirection: 'row', marginHorizontal: 20, marginTop: 16, backgroundColor: Colors.surface, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: Colors.border },
  tab: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  tabActive: { backgroundColor: Colors.primary + '22' },
  tabLabel: { fontSize: 13, color: Colors.textMuted, fontWeight: '600' },
  tabLabelActive: { color: Colors.primary, fontWeight: '700' },
  tabContent: { padding: 20, paddingBottom: 40 },
  // Camera
  permissionPlaceholder: { height: 300, justifyContent: 'center', alignItems: 'center' },
  permissionCard: { alignItems: 'center', padding: 24, gap: 16 },
  permissionTitle: { fontSize: 20, fontWeight: '700', color: Colors.text },
  permissionText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  permissionButton: { width: '100%', borderRadius: 14, overflow: 'hidden' },
  permissionButtonGrad: { height: 52, justifyContent: 'center', alignItems: 'center' },
  permissionButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  manualFallback: { paddingVertical: 8 },
  manualFallbackText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  cameraContainer: { borderRadius: 20, overflow: 'hidden', marginBottom: 16, height: 300 },
  camera: { flex: 1 },
  faceOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  faceFrame: { width: 180, height: 220, position: 'relative' },
  corner: { position: 'absolute', width: 24, height: 24, borderColor: Colors.primary, borderWidth: 3 },
  topLeft: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 8 },
  topRight: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 8 },
  bottomLeft: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 8 },
  bottomRight: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 8 },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: Colors.primary + 'cc' },
  cameraStatus: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, backgroundColor: 'rgba(0,0,0,0.5)', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  statusText: { color: '#fff', fontSize: 13 },
  analyzeButtonWrapper: { borderRadius: 14, overflow: 'hidden', marginBottom: 16 },
  analyzeButton: { height: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  analyzeButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resultsCard: { backgroundColor: Colors.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: Colors.border },
  resultsTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  dominantEmotion: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, backgroundColor: Colors.primary + '11', padding: 14, borderRadius: 14 },
  dominantEmoji: { fontSize: 40 },
  dominantLabel: { fontSize: 20, fontWeight: '800', color: Colors.text },
  dominantConfidence: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  emotionBars: { gap: 4 },
  // Manual
  manualTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 20 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  emojiButton: { width: (width - 72) / 3, aspectRatio: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.border },
  emojiButtonActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '22' },
  emojiButtonEmoji: { fontSize: 32, marginBottom: 4 },
  emojiButtonLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
  emojiButtonLabelActive: { color: Colors.primary },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  stressSlider: { flexDirection: 'row', gap: 6 },
  stressDot: { flex: 1, height: 36, borderRadius: 8 },
  stressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  stressLabel: { fontSize: 11, color: Colors.textMuted },
  notesInput: { backgroundColor: Colors.surface, borderRadius: 14, padding: 14, color: Colors.text, borderWidth: 1, borderColor: Colors.border, minHeight: 100 },
  submitButtonWrapper: { borderRadius: 14, overflow: 'hidden' },
  submitButton: { height: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  // History
  emptyState: { alignItems: 'center', padding: 40, gap: 12 },
  emptyText: { fontSize: 18, fontWeight: '700', color: Colors.text },
  emptySubtext: { fontSize: 14, color: Colors.textMuted },
  historyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border, gap: 12 },
  historyEmoji: { width: 52, height: 52, borderRadius: 16, backgroundColor: Colors.surfaceLight, justifyContent: 'center', alignItems: 'center' },
  historyEmojiText: { fontSize: 28 },
  historyContent: { flex: 1 },
  historyEmotion: { fontSize: 16, fontWeight: '700', color: Colors.text },
  historyMeta: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  historyConfidence: { fontSize: 12, color: Colors.primary, marginTop: 2, fontWeight: '600' },
  historyStress: { alignItems: 'center' },
  historyStressLabel: { fontSize: 10, color: Colors.textMuted },
  historyStressValue: { fontSize: 16, fontWeight: '800', color: Colors.warning },
});

export default EmotionScreen;
