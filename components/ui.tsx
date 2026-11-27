import React from 'react';
import { Text, TextProps, View, Pressable, TextInput, TextInputProps, StyleSheet, ViewStyle } from 'react-native';
import { colors, fonts } from '../constants/theme';

export const T = ({ w = 'regular', style, ...p }: TextProps & { w?: keyof typeof fonts }) => (
  <Text {...p} style={[{ color: colors.text, fontFamily: fonts[w], fontSize: 14 }, style]} />
);

export const Logo = ({ size = 24 }: { size?: number }) => (
  <Text style={{
    fontFamily: fonts.bold,
    fontSize: size,
    color: colors.text,
    letterSpacing: -1,
  }}>
    THE <Text style={{ color: colors.primary }}>CONCERT'S</Text>
    <Text style={{ color: colors.primary }}>.</Text>
  </Text>
);

export const Button = ({ title, onPress, variant = 'primary', disabled, style }:
  { title: string; onPress?: () => void; variant?: 'primary' | 'outline' | 'danger'; disabled?: boolean; style?: ViewStyle }) => (
  <Pressable onPress={onPress} disabled={disabled}
    style={({ pressed }) => [s.btn,
    variant === 'primary' && { backgroundColor: pressed ? colors.primaryPressed : colors.primary },
    variant === 'outline' && { borderWidth: 1, borderColor: colors.border, backgroundColor: pressed ? colors.card2 : 'transparent' },
    variant === 'danger' && { borderWidth: 1, borderColor: colors.danger, backgroundColor: 'transparent' },
    disabled && { opacity: 0.4 }, style]}>
    <T w="semibold" style={{ color: variant === 'primary' ? '#131313' : variant === 'danger' ? colors.danger : colors.text }}>{title}</T>
  </Pressable>
);

export const Input = ({ label, error, ...p }: TextInputProps & { label: string; error?: string }) => (
  <View style={{ marginBottom: 14 }}>
    <T w="medium" style={{ marginBottom: 6, color: colors.muted, fontSize: 13 }}>{label}</T>
    <TextInput placeholderTextColor={colors.dim} {...p}
      style={[s.input, error ? { borderColor: colors.danger } : null]} />
    {error ? <T style={{ color: colors.danger, fontSize: 12, marginTop: 4 }}>{error}</T> : null}
  </View>
);

export const Card = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: 14 }, style]}>{children}</View>
);

export const Badge = ({ label, color }: { label: string; color: string }) => (
  <View style={{ backgroundColor: color + '26', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }}>
    <T w="medium" style={{ color, fontSize: 11 }}>{label}</T>
  </View>
);

export const Chip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
  <Pressable onPress={onPress} style={[s.chip, active && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
    <T w="medium" style={{ fontSize: 13, color: active ? '#131313' : colors.muted }}>{label}</T>
  </Pressable>
);

export const Row = ({ l, r, bold }: { l: string; r: string; bold?: boolean }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 3 }}>
    <T style={{ color: bold ? colors.text : colors.muted }} w={bold ? 'semibold' : 'regular'}>{l}</T>
    <T w={bold ? 'bold' : 'medium'} style={bold ? { color: colors.primary } : undefined}>{r}</T>
  </View>
);

const s = StyleSheet.create({
  btn: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  input: {
    height: 50, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card2,
    color: colors.text, paddingHorizontal: 14, fontFamily: fonts.regular, fontSize: 14
  },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8 },
});
