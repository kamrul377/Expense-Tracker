

import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function DeveloperScreen({ navigation }) {
  const { colors, theme } = useAuth();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // দুই জন ডেভেলপারের তথ্য
  const developers = [
    {
      name: 'Kamrul Islam',
      role: 'Network & System Engineer | Full-Stack Developer',
      bio: 'Passionate about building robust network infrastructures, secure server maintenance, and clean modern web & mobile applications.',
      email: 'kamrul.cse9@gmail.com',
      github: 'https://github.com/kamrul377',
      portfolio: 'https://kamrul-info.vercel.app/',
      icon: 'code-tags',
      color: colors.primary || '#635BEB',
    },
    {
      name: 'Zannatul Mawa',
      role: 'Full-Stack Developer',
      bio: 'Passionate about creating intuitive user interfaces, seamless mobile experiences, and clean design systems.',
      email: 'zannatulmawa38@gmail.com',
      github: 'https://github.com/ZannatulMawa',
      portfolio: 'https://github.com/Zannatmawa',
      icon: 'code-tags',
      color: '#3b45dd',
    },
  ];

  const handleOpenLink = (url) => {
    if (!url) return;
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>Meet the Creators</Text>
        <Text style={styles.headerSubtitle}>The minds behind Expense Tracker</Text>
      </View>

      {/* Developer Cards Loop */}
      {developers.map((dev, index) => (
        <View key={index} style={styles.profileCard}>
          <View style={[styles.avatarContainer, { backgroundColor: dev.color + '18', borderColor: dev.color + '33' }]}>
            <Icon name={dev.icon} size={36} color={dev.color} />
          </View>
          <Text style={styles.name}>{dev.name}</Text>
          <Text style={[styles.role, { color: dev.color }]}>{dev.role}</Text>
          <Text style={styles.bio}>{dev.bio}</Text>

          <View style={styles.cardActions}>
            {dev.portfolio ? (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: dev.color + '15' }]}
                onPress={() => handleOpenLink(dev.portfolio)}
              >
                <Icon name="web" size={16} color={dev.color} />
                <Text style={[styles.actionText, { color: dev.color }]}>Portfolio</Text>
              </TouchableOpacity>
            ) : null}

            {dev.github ? (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: dev.color + '15' }]}
                onPress={() => handleOpenLink(dev.github)}
              >
                <Icon name="github" size={16} color={dev.color} />
                <Text style={[styles.actionText, { color: dev.color }]}>GitHub</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: dev.color + '15' }]}
              onPress={() => handleOpenLink(`mailto:${dev.email}`)}
            >
              <Icon name="email-outline" size={16} color={dev.color} />
              <Text style={[styles.actionText, { color: dev.color }]}>Email</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* App Info Footer */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Expense Tracker v1.0.0</Text>
        <Text style={styles.footerSubText}>Designed & Developed with React Native</Text>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: colors.bg,
      padding: 16,
      paddingBottom: 40,
    },
    headerBox: {
      alignItems: 'center',
      marginBottom: 20,
      marginTop: 6,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 13,
      color: colors.muted,
      marginTop: 2,
    },
    profileCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    avatarContainer: {
      width: 70,
      height: 70,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 14,
      borderWidth: 1,
    },
    name: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 2,
      textAlign: 'center',
    },
    role: {
      fontSize: 12,
      fontWeight: '700',
      marginBottom: 8,
      textAlign: 'center',
    },
    bio: {
      fontSize: 13,
      color: colors.muted,
      textAlign: 'center',
      lineHeight: 18,
      marginBottom: 16,
    },
    cardActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 8,
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 10,
    },
    actionText: {
      fontSize: 12,
      fontWeight: '700',
    },
    footerContainer: {
      alignItems: 'center',
      marginTop: 10,
    },
    footerText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    footerSubText: {
      fontSize: 11,
      color: colors.muted,
    },
  });

