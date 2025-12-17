import React from 'react';
import { View} from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface StylesProps {
  styles: any;
}

export const InfoCard = ({ title, children, styles }: { title: string; children: React.ReactNode } & StylesProps) => (
  <View style={styles.infoCard}>
    <ThemedText type="subtitle" style={styles.infoCardTitle}>{title}</ThemedText>
    <View style={styles.infoCardContent}>
      {children}
    </View>
  </View>
);

export const Badge = ({ children, styles }: { children: React.ReactNode } & StylesProps) => (
  <View style={styles.badge}>
    <ThemedText style={styles.badgeText}>{children}</ThemedText>
  </View>
);

export const InfoRow = ({ label, value, styles }: { label: string, value?: string | number | null } & StylesProps) => (
  <View style={styles.modalInfoRow}>
    <ThemedText style={styles.modalInfoLabel}>{label}</ThemedText>
    <ThemedText style={styles.modalInfoValue}>{value || 'No especificado'}</ThemedText>
  </View>
);

export const ItemCard = ({ title, label1, value1, label2, value2, label3, value3, styles }: 
  { title: string, label1: string, value1?: string, label2: string, value2?: string, label3?: string, value3?: string } & StylesProps) => (
  <View style={styles.itemCard}>
    <ThemedText style={styles.itemTitle}>{title}</ThemedText>
    <InfoRow label={label1} value={value1} styles={styles} />
    <InfoRow label={label2} value={value2} styles={styles} />
    {label3 && <InfoRow label={label3} value={value3} styles={styles} />}
  </View>
);