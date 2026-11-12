import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../utils/theme';

export function Field({ label, ...props }) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <TextInput style={s.input} placeholderTextColor={colors.muted} {...props} />
    </View>
  );
}

export function Chip({ label, selected, onPress, color }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        s.chip,
        selected && { backgroundColor: color || colors.ink, borderColor: color || colors.ink },
      ]}
    >
      <Text style={[s.chipText, selected && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

export function PrimaryButton({ title, onPress, variant = 'solid', disabled }) {
  const outline = variant === 'outline';
  const danger = variant === 'danger';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        s.btn,
        outline && s.btnOutline,
        danger && s.btnDanger,
        disabled && { opacity: 0.4 },
      ]}
    >
      <Text style={[s.btnText, (outline || danger) && { color: danger ? colors.danger : colors.primary }]}>
        {title}
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  field: { marginBottom: 14 },
  label: { fontSize: 13, color: colors.muted, marginBottom: 6 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipText: { color: colors.ink, fontWeight: '600' },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  btnOutline: { backgroundColor: 'transparent' },
  btnDanger: { backgroundColor: 'transparent', borderColor: colors.danger },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});