import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/colors';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.username?.slice(0, 2).toUpperCase() ?? 'AI';

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await logout();
        },
      },
    ]);
  };

  const stats = [
    { label: 'Days Tracked', value: '24', icon: 'calendar-check' },
    { label: 'Current Streak', value: '7', icon: 'fire' },
    { label: 'Avg Wellness', value: '68%', icon: 'heart-pulse' },
  ];

  const settingSections = [
    {
      title: 'Notifications',
      items: [
        {
          icon: 'bell-outline',
          label: 'All Notifications',
          type: 'toggle' as const,
          value: notificationsEnabled,
          onToggle: () => setNotificationsEnabled(!notificationsEnabled),
        },
        {
          icon: 'alarm',
          label: 'Daily Check-in Reminder',
          type: 'toggle' as const,
          value: dailyReminders,
          onToggle: () => setDailyReminders(!dailyReminders),
        },
        {
          icon: 'chart-bar',
          label: 'Weekly Wellness Report',
          type: 'toggle' as const,
          value: weeklyReport,
          onToggle: () => setWeeklyReport(!weeklyReport),
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          icon: 'account-edit-outline',
          label: 'Edit Profile',
          type: 'link' as const,
          onPress: () => Alert.alert('Coming Soon', 'Profile editing will be available in the next update.'),
        },
        {
          icon: 'lock-outline',
          label: 'Change Password',
          type: 'link' as const,
          onPress: () => Alert.alert('Coming Soon', 'Password change will be available in the next update.'),
        },
        {
          icon: 'export-variant',
          label: 'Export My Data',
          type: 'link' as const,
          onPress: () => Alert.alert('Export Data', 'Your wellness data will be exported as CSV.'),
        },
      ],
    },
    {
      title: 'Privacy & Legal',
      items: [
        {
          icon: 'shield-check-outline',
          label: 'Privacy Policy',
          type: 'link' as const,
          onPress: () => Alert.alert('Privacy Policy', 'Your data is encrypted and stored securely. We never sell your personal information.'),
        },
        {
          icon: 'file-document-outline',
          label: 'Terms of Service',
          type: 'link' as const,
          onPress: () => Alert.alert('Terms', 'By using BurnoutAI, you agree to our terms of service.'),
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: 'information-outline',
          label: 'App Version',
          type: 'info' as const,
          value: '1.0.0',
        },
        {
          icon: 'brain',
          label: 'AI Model',
          type: 'info' as const,
          value: 'GPT-4 Enhanced',
        },
        {
          icon: 'star-outline',
          label: 'Rate BurnoutAI',
          type: 'link' as const,
          onPress: () => Alert.alert('Thank You!', 'Your support means a lot to us!'),
        },
        {
          icon: 'message-text-outline',
          label: 'Send Feedback',
          type: 'link' as const,
          onPress: () => Alert.alert('Feedback', 'Thank you for your interest! Email us at feedback@burnoutai.com'),
        },
      ],
    },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#312e81', Colors.background]} style={styles.header}>
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.full_name ?? user?.username ?? 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email ?? 'demo@burnoutai.com'}</Text>
              <View style={styles.memberBadge}>
                <MaterialCommunityIcons name="shield-star" size={12} color={Colors.warning} />
                <Text style={styles.memberText}>Premium Member</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <MaterialCommunityIcons name={stat.icon as any} size={20} color={Colors.primary} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Burnout Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <MaterialCommunityIcons name="brain" size={18} color={Colors.primary} />
            <Text style={styles.summaryTitle}>Your Wellness Summary</Text>
          </View>
          <View style={styles.summaryStats}>
            {[
              { label: 'Burnout Risk', value: '42%', color: Colors.warning },
              { label: 'Wellness Score', value: '62/100', color: Colors.success },
              { label: 'Risk Level', value: 'Moderate', color: Colors.warning },
            ].map((item) => (
              <View key={item.label} style={styles.summaryItem}>
                <Text style={[styles.summaryItemValue, { color: item.color }]}>{item.value}</Text>
                <Text style={styles.summaryItemLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Settings Sections */}
        {settingSections.map((section) => (
          <View key={section.title} style={styles.settingSection}>
            <Text style={styles.settingSectionTitle}>{section.title}</Text>
            <View style={styles.settingCard}>
              {section.items.map((item, index) => (
                <View key={item.label}>
                  <View style={styles.settingRow}>
                    <View style={styles.settingLeft}>
                      <View style={styles.settingIcon}>
                        <MaterialCommunityIcons name={item.icon as any} size={18} color={Colors.primary} />
                      </View>
                      <Text style={styles.settingLabel}>{item.label}</Text>
                    </View>
                    <View style={styles.settingRight}>
                      {item.type === 'toggle' && (
                        <Switch
                          value={item.value as boolean}
                          onValueChange={() => {
                            Haptics.selectionAsync();
                            (item as any).onToggle?.();
                          }}
                          trackColor={{ false: Colors.surfaceLight, true: Colors.primary + '66' }}
                          thumbColor={(item.value as boolean) ? Colors.primary : Colors.textMuted}
                        />
                      )}
                      {item.type === 'link' && (
                        <TouchableOpacity onPress={(item as any).onPress} activeOpacity={0.7}>
                          <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textMuted} />
                        </TouchableOpacity>
                      )}
                      {item.type === 'info' && (
                        <Text style={styles.settingInfoValue}>{(item as any).value}</Text>
                      )}
                    </View>
                  </View>
                  {index < section.items.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <MaterialCommunityIcons name="logout" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>BurnoutAI v1.0.0 • Built with care for your wellbeing</Text>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20 },
  header: { borderRadius: 24, padding: 20, marginVertical: 16 },
  avatarSection: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  userInfo: { flex: 1 },
  userName: { fontSize: 22, fontWeight: '800', color: Colors.text },
  userEmail: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  memberBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, backgroundColor: Colors.warning + '22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start' },
  memberText: { fontSize: 11, color: Colors.warning, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 4, borderWidth: 1, borderColor: Colors.border },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600', textAlign: 'center' },
  summaryCard: { backgroundColor: Colors.surface, borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: Colors.primary + '33', borderLeftWidth: 3, borderLeftColor: Colors.primary },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  summaryTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  summaryStats: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center', gap: 4 },
  summaryItemValue: { fontSize: 18, fontWeight: '800' },
  summaryItemLabel: { fontSize: 11, color: Colors.textMuted },
  settingSection: { marginBottom: 20 },
  settingSectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 },
  settingCard: { backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.border },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.primary + '22', justifyContent: 'center', alignItems: 'center' },
  settingLabel: { fontSize: 14, color: Colors.text, fontWeight: '500' },
  settingRight: {},
  settingInfoValue: { fontSize: 13, color: Colors.textMuted },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: 60 },
  logoutButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, height: 52, borderRadius: 14, backgroundColor: Colors.danger + '11', borderWidth: 1, borderColor: Colors.danger + '44', marginBottom: 20 },
  logoutText: { fontSize: 16, fontWeight: '700', color: Colors.danger },
  footer: { textAlign: 'center', fontSize: 12, color: Colors.textDim, marginBottom: 8 },
});

export default ProfileScreen;
