
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, commonStyles } from '../styles/commonStyles';
import { domains } from '../data/domains';
import { identities } from '../data/identities';
import { useStorage } from '../hooks/useStorage';
import DomainCard from '../components/DomainCard';
import OceanProgress from '../components/OceanProgress';
import SimpleBottomSheet from '../components/BottomSheet';
import PresenceSlider from '../components/PresenceSlider';
import { Domain, DailyLog } from '../types';

export default function HomeScreen() {
  const router = useRouter();
  const [userDomains, setUserDomains, domainsLoading, domainsError] = useStorage<Domain[]>('domains', domains);
  const [dailyLogs, setDailyLogs, logsLoading, logsError] = useStorage<DailyLog[]>('dailyLogs', []);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [isLoggingVisible, setIsLoggingVisible] = useState(false);
  const [presenceValue, setPresenceValue] = useState(50);
  const [refreshing, setRefreshing] = useState(false);

  // Calculate overall progress with enhanced algorithm
  const overallProgress = React.useMemo(() => {
    if (userDomains.length === 0) return 0;
    
    const totalProgress = userDomains.reduce((sum, domain) => {
      // Weight recent activity more heavily
      const recentBonus = domain.isLogged ? 10 : 0;
      return sum + Math.min(100, domain.progress + recentBonus);
    }, 0);
    
    return totalProgress / userDomains.length;
  }, [userDomains]);
  
  // Get today's date
  const today = new Date().toISOString().split('T')[0];
  
  // Enhanced domain progress calculation
  useEffect(() => {
    if (logsLoading || domainsLoading) return;
    
    const updatedDomains = userDomains.map(domain => {
      const todayLog = dailyLogs.find(log => 
        log.domainId === domain.id && log.date === today
      );
      
      // Calculate progress based on recent logs
      const domainLogs = dailyLogs
        .filter(log => log.domainId === domain.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 30); // Last 30 days
      
      let newProgress = 0;
      if (domainLogs.length > 0) {
        const avgPresence = domainLogs.reduce((sum, log) => sum + log.presence, 0) / domainLogs.length;
        const consistencyBonus = Math.min(25, domainLogs.length * 2);
        const recentActivityBonus = todayLog ? 5 : 0;
        
        newProgress = Math.min(100, avgPresence + consistencyBonus + recentActivityBonus);
      }
      
      return {
        ...domain,
        progress: newProgress,
        isLogged: !!todayLog,
      };
    });
    
    setUserDomains(updatedDomains);
  }, [dailyLogs, today]);

  const handleDomainPress = (domain: Domain) => {
    console.log('🌊 Domain pressed:', domain.name);
    router.push(`/domain/${domain.id}`);
  };

  const handleLogPress = (domain: Domain) => {
    console.log('💧 Log pressed for domain:', domain.name);
    setSelectedDomain(domain);
    
    // Get existing log for today if it exists
    const existingLog = dailyLogs.find(log => 
      log.domainId === domain.id && log.date === today
    );
    setPresenceValue(existingLog?.presence || 50);
    setIsLoggingVisible(true);
  };

  const handleSaveLog = async () => {
    if (!selectedDomain) return;

    const newLog: DailyLog = {
      id: `${selectedDomain.id}-${today}`,
      date: today,
      domainId: selectedDomain.id,
      presence: presenceValue,
    };

    // Update or add the log
    const updatedLogs = dailyLogs.filter(log => 
      !(log.domainId === selectedDomain.id && log.date === today)
    );
    updatedLogs.push(newLog);
    
    await setDailyLogs(updatedLogs);
    setIsLoggingVisible(false);
    
    console.log('💧 Drop added to ocean:', newLog);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getMotivationalText = () => {
    const loggedCount = userDomains.filter(d => d.isLogged).length;
    const totalDomains = userDomains.length;
    
    if (loggedCount === 0) return 'Ready to drop into your identity?';
    if (loggedCount === totalDomains) return 'All domains flowing beautifully today! 🌊';
    
    const percentage = Math.round((loggedCount / totalDomains) * 100);
    return `${loggedCount}/${totalDomains} drops added today (${percentage}%)`;
  };

  const getStreakInfo = () => {
    const streaks = userDomains.map(domain => {
      const domainLogs = dailyLogs
        .filter(log => log.domainId === domain.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      let streak = 0;
      const today = new Date();
      
      for (let i = 0; i < domainLogs.length; i++) {
        const logDate = new Date(domainLogs[i].date);
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);
        
        if (logDate.toDateString() === expectedDate.toDateString()) {
          streak++;
        } else {
          break;
        }
      }
      
      return { domain: domain.name, streak };
    });
    
    const maxStreak = Math.max(...streaks.map(s => s.streak), 0);
    const avgStreak = streaks.reduce((sum, s) => sum + s.streak, 0) / streaks.length;
    
    if (maxStreak === 0) return 'Start your streak today';
    if (maxStreak === avgStreak) return `${maxStreak} day streak across all domains! 🔥`;
    return `Best: ${maxStreak} days • Avg: ${Math.round(avgStreak)} days`;
  };

  if (domainsLoading || logsLoading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.centerContent, { flex: 1 }]}>
          <Text style={styles.loadingText}>Loading your ocean... 🌊</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.appTitle}>drop</Text>
        <Text style={styles.motivational}>{getMotivationalText()}</Text>
        <Text style={styles.streak}>{getStreakInfo()}</Text>
        
        {(domainsError || logsError) && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning-outline" size={16} color={colors.warning} />
            <Text style={styles.errorText}>
              {domainsError || logsError}
            </Text>
          </View>
        )}
      </View>

      <ScrollView 
        style={commonStyles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <OceanProgress 
          progress={overallProgress}
          title="Your Identity Ocean"
          subtitle="Small drops create lasting change"
        />

        <View style={styles.domainsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Life Domains</Text>
            <Text style={styles.sectionSubtitle}>
              {userDomains.filter(d => d.isLogged).length}/{userDomains.length} logged today
            </Text>
          </View>
          
          {userDomains.map((domain) => (
            <DomainCard
              key={domain.id}
              domain={domain}
              onPress={() => handleDomainPress(domain)}
              onLogPress={() => handleLogPress(domain)}
            />
          ))}
        </View>

        <TouchableOpacity 
          style={styles.commitmentButton}
          onPress={() => router.push('/commitments')}
        >
          <View style={styles.commitmentIcon}>
            <Ionicons name="calendar-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.commitmentContent}>
            <Text style={styles.commitmentText}>Quarterly Commitments</Text>
            <Text style={styles.commitmentSubtext}>90-day identity journeys</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </TouchableOpacity>

        {/* Add some bottom padding for better scrolling */}
        <View style={{ height: 40 }} />
      </ScrollView>

      <SimpleBottomSheet
        isVisible={isLoggingVisible}
        onClose={() => setIsLoggingVisible(false)}
      >
        <View style={styles.loggingContainer}>
          <Text style={styles.loggingTitle}>
            {selectedDomain?.name} Presence
          </Text>
          <Text style={styles.loggingSubtitle}>
            How present were you in embodying your identity today?
          </Text>
          
          <PresenceSlider
            value={presenceValue}
            onValueChange={setPresenceValue}
            title="Presence Level"
          />
          
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSaveLog}
          >
            <Text style={styles.saveButtonText}>Add Drop to Ocean</Text>
            <Ionicons name="water" size={18} color="white" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </SimpleBottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  greeting: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  appTitle: {
    fontSize: 36,
    fontWeight: '200',
    color: colors.primary,
    textAlign: 'center',
    marginVertical: 4,
    letterSpacing: 2,
  },
  motivational: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  streak: {
    fontSize: 12,
    color: colors.success,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 18,
    color: colors.textLight,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: `${colors.warning}20`,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  errorText: {
    fontSize: 12,
    color: colors.warning,
    marginLeft: 4,
    flex: 1,
  },
  domainsSection: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '500',
  },
  commitmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 20,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
    elevation: 4,
  },
  commitmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commitmentContent: {
    flex: 1,
    marginLeft: 16,
  },
  commitmentText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  commitmentSubtext: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
  loggingContainer: {
    padding: 24,
  },
  loggingTitle: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  loggingSubtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 20,
    boxShadow: '0px 6px 12px rgba(46, 139, 139, 0.25)',
    elevation: 6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
