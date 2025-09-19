
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, commonStyles } from '../styles/commonStyles';
import { domains } from '../data/domains';
import { identities } from '../data/identities';
import { useStorage } from '../hooks/useStorage';
import { QuarterlyCommitment } from '../types';

export default function CommitmentsScreen() {
  const router = useRouter();
  const [commitments] = useStorage<QuarterlyCommitment[]>('commitments', []);
  
  const activeCommitments = commitments.filter(c => c.isActive);
  
  const getCommitmentInfo = (commitment: QuarterlyCommitment) => {
    const domain = domains.find(d => d.id === commitment.domainId);
    const identity = identities.find(i => i.id === commitment.identityId);
    const startDate = new Date(commitment.startDate);
    const endDate = new Date(commitment.endDate);
    const today = new Date();
    
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, totalDays - daysElapsed);
    const progressPercent = Math.min(100, (daysElapsed / totalDays) * 100);
    
    return {
      domain,
      identity,
      daysRemaining,
      progressPercent,
      startDate,
      endDate,
    };
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quarterly Commitments</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>90-Day Identity Journeys</Text>
          <Text style={styles.introText}>
            Each commitment is a 90-day journey of becoming. Focus on embodying your chosen 
            identity rather than achieving specific goals.
          </Text>
        </View>

        {activeCommitments.length > 0 ? (
          <View style={styles.commitmentsSection}>
            <Text style={styles.sectionTitle}>Active Commitments</Text>
            {activeCommitments.map((commitment) => {
              const info = getCommitmentInfo(commitment);
              if (!info.domain || !info.identity) return null;
              
              return (
                <View key={commitment.id} style={styles.commitmentCard}>
                  <View style={styles.commitmentHeader}>
                    <View style={styles.domainInfo}>
                      <Ionicons 
                        name={info.domain.icon as any} 
                        size={24} 
                        color={info.domain.color} 
                      />
                      <Text style={styles.domainName}>{info.domain.name}</Text>
                    </View>
                    <Text style={styles.daysRemaining}>
                      {info.daysRemaining} days left
                    </Text>
                  </View>
                  
                  <View style={styles.identitySection}>
                    <Ionicons 
                      name={info.identity.icon as any} 
                      size={20} 
                      color={colors.textLight} 
                    />
                    <Text style={styles.identityName}>{info.identity.name}</Text>
                  </View>
                  
                  <Text style={styles.identityDescription}>
                    {info.identity.description}
                  </Text>
                  
                  <View style={styles.progressSection}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill,
                          { 
                            width: `${info.progressPercent}%`,
                            backgroundColor: info.domain.color,
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {Math.round(info.progressPercent)}% complete
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No Active Commitments</Text>
            <Text style={styles.emptyText}>
              Visit each domain to choose your identity for the next 90 days
            </Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => router.back()}
            >
              <Text style={styles.exploreButtonText}>Explore Domains</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.philosophySection}>
          <Text style={styles.philosophyTitle}>The 90-Day Philosophy</Text>
          <View style={styles.philosophyCard}>
            <Text style={styles.philosophyText}>
              • <Text style={styles.bold}>Long enough</Text> to create lasting neural pathways
            </Text>
            <Text style={styles.philosophyText}>
              • <Text style={styles.bold}>Short enough</Text> to maintain focus and motivation
            </Text>
            <Text style={styles.philosophyText}>
              • <Text style={styles.bold}>Natural resistance</Text> to frequent identity switching
            </Text>
            <Text style={styles.philosophyText}>
              • <Text style={styles.bold}>Seasonal alignment</Text> with natural change cycles
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  introSection: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 32,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  introText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  commitmentsSection: {
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  commitmentCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  commitmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  domainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  domainName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  daysRemaining: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '500',
  },
  identitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  identityName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  identityDescription: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
    marginBottom: 16,
  },
  progressSection: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  exploreButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  philosophySection: {
    marginHorizontal: 16,
    marginTop: 32,
    marginBottom: 32,
  },
  philosophyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  philosophyCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  philosophyText: {
    fontSize: 16,
    color: colors.textLight,
    lineHeight: 24,
    marginBottom: 8,
  },
  bold: {
    fontWeight: '600',
    color: colors.text,
  },
});
