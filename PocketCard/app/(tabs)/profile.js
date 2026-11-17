import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/auth-context';
import { useTheme } from '../../utils/theme';
import { confirmAction, showAlert } from '../../utils/alert';
import { Field, GlassCard, PrimaryButton } from '../../components/ui';

// Avatares rápidos pré-definidos caso o usuário queira escolher
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateUserProfile } = useAuth();
  const { colors, themeMode, setThemeMode, isDark } = useTheme();

  const [name, setName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateUserProfile({
        displayName: name.trim(),
        photoURL: photoURL.trim(),
      });
      showAlert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (e) {
      showAlert('Erro', e?.message || 'Falha ao atualizar perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    confirmAction({
      title: 'Sair da conta',
      message: 'Tem certeza que deseja encerrar sua sessão?',
      confirmText: 'Sair',
      destructive: true,
      onConfirm: async () => {
        try {
          await logout();
          router.replace('/login');
        } catch (e) {
          showAlert('Erro ao sair', e?.message || String(e));
        }
      },
    });
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.bg }]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Card do Usuário */}
      <GlassCard style={styles.userCard}>
        <View style={styles.avatarRow}>
          <View
            style={[
              styles.avatarContainer,
              { borderColor: colors.primary, backgroundColor: colors.surface },
            ]}
          >
            {photoURL ? (
              <Image source={{ uri: photoURL }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={40} color={colors.primary} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.userName, { color: colors.ink }]}>
              {user?.displayName || user?.email?.split('@')[0] || 'Usuário'}
            </Text>
            <Text style={[styles.userEmail, { color: colors.muted }]}>{user?.email}</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={14} color={colors.secondary} />
              <Text style={[styles.verifiedText, { color: colors.secondary }]}>Conta Verificada</Text>
            </View>
          </View>
        </View>

        {/* Escolha rápida de fotos */}
        <Text style={[styles.subLabel, { color: colors.muted }]}>
          Escolha um avatar ou insira o link abaixo:
        </Text>
        <View style={styles.avatarPresets}>
          {AVATAR_PRESETS.map((url, i) => (
            <Pressable
              key={i}
              onPress={() => setPhotoURL(url)}
              style={[
                styles.presetItem,
                photoURL === url && { borderColor: colors.primary, borderWidth: 2 },
              ]}
            >
              <Image source={{ uri: url }} style={styles.presetImage} />
            </Pressable>
          ))}
          {photoURL ? (
            <Pressable
              onPress={() => setPhotoURL('')}
              style={[styles.presetClear, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </Pressable>
          ) : null}
        </View>

        <Field
          label="Nome Completo"
          value={name}
          onChangeText={setName}
          placeholder="Ex.: Igor Bruno"
        />

        <Field
          label="URL da Foto de Perfil"
          value={photoURL}
          onChangeText={setPhotoURL}
          placeholder="https://exemplo.com/foto.jpg"
          autoCapitalize="none"
        />

        <PrimaryButton
          title={saving ? 'Salvando...' : 'Salvar Alterações'}
          onPress={handleSaveProfile}
          disabled={saving}
          loading={saving}
        />
      </GlassCard>

      {/* Seção de Preferências / Dark Mode */}
      <Text style={[styles.sectionTitle, { color: colors.muted }]}>PREFERÊNCIAS DE TEMA</Text>
      <GlassCard style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(124, 92, 252, 0.12)' }]}>
              <Ionicons name="moon" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.settingName, { color: colors.ink }]}>Modo Escuro (Dark UI)</Text>
              <Text style={[styles.settingDesc, { color: colors.muted }]}>
                {isDark ? 'Tema escuro premium ativo' : 'Tema claro ativo'}
              </Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={(val) => setThemeMode(val ? 'dark' : 'light')}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFF"
          />
        </View>
      </GlassCard>

      {/* Botão de Logout */}
      <View style={{ marginTop: 20 }}>
        <PrimaryButton
          title="Encerrar Sessão"
          variant="danger"
          onPress={handleLogout}
          icon={<Ionicons name="log-out-outline" size={18} color={colors.danger} />}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  userCard: {
    gap: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '700',
  },
  subLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  avatarPresets: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 4,
  },
  presetItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  presetImage: {
    width: '100%',
    height: '100%',
  },
  presetClear: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginLeft: 4,
    marginTop: 10,
  },
  settingsCard: {
    gap: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingName: {
    fontSize: 15,
    fontWeight: '700',
  },
  settingDesc: {
    fontSize: 12,
    marginTop: 2,
  },
});
