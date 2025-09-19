
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, commonStyles } from '../styles/commonStyles';
import { Identity } from '../types';

interface IdentitySelectorProps {
  identities: Identity[];
  selectedId?: string;
  onSelect: (identity: Identity) => void;
  domain: string;
}

export default function IdentitySelector({ 
  identities, 
  selectedId, 
  onSelect, 
  domain 
}: IdentitySelectorProps) {
  const domainIdentities = identities.filter(identity => identity.domain === domain);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Identity</Text>
      <Text style={styles.subtitle}>
        Who do you want to become in the next 90 days?
      </Text>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {domainIdentities.map((identity) => (
          <TouchableOpacity
            key={identity.id}
            style={[
              styles.identityCard,
              selectedId === identity.id && styles.selectedCard
            ]}
            onPress={() => onSelect(identity)}
          >
            <View style={styles.cardHeader}>
              <Ionicons 
                name={identity.icon as any} 
                size={24} 
                color={selectedId === identity.id ? colors.primary : colors.textLight} 
              />
              <Text style={[
                styles.identityName,
                selectedId === identity.id && styles.selectedText
              ]}>
                {identity.name}
              </Text>
              {selectedId === identity.id && (
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              )}
            </View>
            <Text style={[
              styles.identityDescription,
              selectedId === identity.id && styles.selectedDescription
            ]}>
              {identity.description}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  identityCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: colors.backgroundAlt,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  identityName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  selectedText: {
    color: colors.primary,
  },
  identityDescription: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
  selectedDescription: {
    color: colors.text,
  },
});
