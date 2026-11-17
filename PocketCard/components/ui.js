import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors as defaultColors, useTheme } from '../utils/theme';

export function GlassCard({ children, style, glow }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        s.glassCard,
        {
          backgroundColor: colors.glassCard || colors.surface,
          borderColor: glow ? colors.primaryGlow || colors.border : colors.border,
        },
        glow && s.glassCardGlow,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Field({ label, ...props }) {
  const { colors } = useTheme();
  return (
    <View style={s.field}>
      <Text style={[s.label, { color: colors.muted }]}>{label}</Text>
      <TextInput
        style={[
          s.input,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.ink,
          },
        ]}
        placeholderTextColor={colors.muted}
        {...props}
      />
    </View>
  );
}

export function Chip({ label, selected, onPress, color }) {
  const { colors } = useTheme();
  const activeColor = color || colors.ink;
  return (
    <Pressable
      onPress={onPress}
      style={[
        s.chip,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        selected && { backgroundColor: activeColor, borderColor: activeColor },
      ]}
    >
      <Text
        style={[
          s.chipText,
          { color: colors.ink },
          selected && { color: '#fff' },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function PrimaryButton({
  title,
  onPress,
  variant = 'solid',
  disabled,
  loading = false,
  icon,
}) {
  const { colors } = useTheme();
  const outline = variant === 'outline';
  const danger = variant === 'danger';
  const secondary = variant === 'secondary';

  let btnBg = colors.primary;
  let btnBorder = colors.primary;
  let textColor = '#fff';

  if (outline) {
    btnBg = 'transparent';
    btnBorder = colors.borderHighlight || colors.primary;
    textColor = colors.primary;
  } else if (danger) {
    btnBg = 'transparent';
    btnBorder = colors.danger;
    textColor = colors.danger;
  } else if (secondary) {
    btnBg = colors.secondary;
    btnBorder = colors.secondary;
    textColor = '#080B12';
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        s.btn,
        {
          backgroundColor: btnBg,
          borderColor: btnBorder,
        },
        (disabled || loading) && { opacity: 0.5 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={s.btnContent}>
          {icon ? <View style={s.btnIcon}>{icon}</View> : null}
          <Text style={[s.btnText, { color: textColor }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  glassCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  glassCardGlow: {
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 6,
  },
  field: { marginBottom: 14 },
  label: { fontSize: 13, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontWeight: '600' },
  btn: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: { fontWeight: '700', fontSize: 16 },
});
