
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, commonStyles } from '../../styles/commonStyles';
import { domains } from '../../data/domains';
import { identities } from '../../data/identities';
import { useStorage } from '../../hooks/useStorage';
import OceanProgress from '../../components/OceanProgress';
import SimpleBottomSheet from '../../components/BottomSheet';
import IdentitySelector from '../../components/IdentitySelector';
import { Domain, Identity, QuarterlyCommitment } from '../../types';

export default function DomainScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [userDomains, setUserDomains] = useStorage<Domain[]>('domains', domains);
  const [commitments, setCommitments] = useStorage<QuarterlyCommitment[]>('commitments', []);
  const [isIdentitySheetVisible, setIsIdentitySheetVisible] = useState(false);
  
  const domain = userDomains.find(d => d.id === id);
  const currentCommitment = commitments.find(c => c.domainId === id && c.isActive);
  const currentIdentity = currentCommitment ? 
    identities.find(i => i.id === currentCommitment.identityId) : null;

  if (!domain) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <Text style={commonStyles.title}>Domain not found</Text>
      </SafeAreaView>
    );
  }

  const handleIdentitySelect = (identity: Identity) => {
    console.log('Identity selected:', identity.name);
    
    // End current commitment if exists
    const updatedCommitments = commitments.map(c => 
      c.domainId === id ? { ...c, isActive: false } : c
    );
    
    // Create new commitment
    const newCommitment: QuarterlyCommitment = {
      id: `${id}-${Date.now()}`,
      domainId: id!,
      identityId: identity.id,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
      isActive: true,
    };
    
    updatedCommitments.push(newCommitment);
    setCommitments(updatedCommitments);
    
    // Update domain with current identity
    const updatedDomains = userDomains.map(d => 
      d.id === id ? { ...d, currentIdentity: identity.name } : d
    );
    setUserDomains(updatedDomains);
    
    setIsIdentitySheetVisible(false);
  };

  const getDaysRemaining = () => {
    if (!currentCommitment) return 0;
    const endDate = new Date(currentCommitment.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getProgressInsight = () => {
    const progress = domain.progress;
    if (progress < 25) return 'Just beginning your journey - every drop counts';
    if (progress < 50) return 'Building momentum - you&apos;re creating ripples';
    if (progress < 75) return 'Strong flow developing - identity taking shape';
    return 'Deep embodiment - you are becoming who you choose to be';
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
        <Text style={styles.headerTitle}>{domain.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        <OceanProgress 
          progress={domain.progress}
          title={`${domain.name} Ocean`}
          subtitle={getProgressInsight()}
        />

        <View style={styles.identitySection}>
          <Text style={styles.sectionTitle}>Current Identity</Text>
          {currentIdentity ? (
            <View style={styles.identityCard}>
              <View style={styles.identityHeader}>
                <Ionicons 
                  name={currentIdentity.icon as any} 
                  size={28} 
                  color={domain.color} 
                />
                <View style={styles.identityInfo}>
                  <Text style={styles.identityName}>{currentIdentity.name}</Text>
                  <Text style={styles.daysRemaining}>
                    {getDaysRemaining()} days remaining in commitment
                  </Text>
                </View>
              </View>
              <Text style={styles.identityDescription}>
                {currentIdentity.description}
              </Text>
              <TouchableOpacity 
                style={styles.changeButton}
                onPress={() => setIsIdentitySheetVisible(true)}
              >
                <Text style={styles.changeButtonText}>Change Identity</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.noIdentityCard}>
              <Ionicons name="help-circle-outline" size={48} color={colors.textLight} />
              <Text style={styles.noIdentityTitle}>No Identity Selected</Text>
              <Text style={styles.noIdentityText}>
                Choose who you want to become in this domain for the next 90 days
              </Text>
              <TouchableOpacity 
                style={styles.selectButton}
                onPress={() => setIsIdentitySheetVisible(true)}
              >
                <Text style={styles.selectButtonText}>Choose Identity</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Insights</Text>
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Identity Embodiment</Text>
            <Text style={styles.insightText}>
              Focus on being rather than doing. Each day you embody your chosen identity, 
              you strengthen the neural pathways that make it your natural way of being.
            </Text>
          </View>
        </View>
      </ScrollView>

      <SimpleBottomSheet
        isVisible={isIdentitySheetVisible}
        onClose={() => setIsIdentitySheetVisible(false)}
      >
        <IdentitySelector
          identities={identities}
          selectedId={currentIdentity?.id}
          onSelect={handleIdentitySelect}
          domain={domain.id}
        />
      </SimpleBottomSheet>
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
  identitySection: {
    marginTop: 20,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  identityCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  identityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  identityInfo: {
    marginLeft: 16,
    flex: 1,
  },
  identityName: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
  },
  daysRemaining: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  identityDescription: {
    fontSize: 16,
    color: colors.textLight,
    lineHeight: 22,
    marginBottom: 20,
  },
  changeButton: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  changeButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  noIdentityCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  noIdentityTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  noIdentityText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  selectButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  selectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  insightsSection: {
    marginTop: 32,
    marginHorizontal: 16,
    marginBottom: 32,
  },
  insightCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  insightText: {
    fontSize: 16,
    color: colors.textLight,
    lineHeight: 22,
  },
});
