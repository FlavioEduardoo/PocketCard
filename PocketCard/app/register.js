import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../store/auth-context';
import { colors } from '../utils/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    if (!email.trim() || !password || !confirmPassword) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      await register(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      let msg = 'Erro ao criar conta. Tente novamente.';
      if (error.code === 'auth/configuration-not-found') {
        msg = 'O serviço de Autenticação (E-mail/Senha) ainda não foi ativado no Firebase Console deste projeto.';
      } else if (error.code === 'auth/email-already-in-use') {
        msg = 'Este e-mail já está em uso.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Formato de e-mail inválido.';
      } else if (error.code === 'auth/weak-password') {
        msg = 'A senha é muito fraca. Escolha uma senha mais forte.';
      } else if (error.message) {
        msg = error.message;
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Text style={styles.formHeaderTitle}>Criar Conta</Text>
            <Text style={styles.formSubtitle}>Cadastre-se para gerenciar seus cartões</Text>
          </View>

          <View style={styles.inputs}>
            <View style={styles.inputBox}>
              <Text style={styles.inputBoxLabel}>E-MAIL</Text>
              <View style={styles.inputField}>
                <TextInput
                  style={styles.inputFieldInput}
                  placeholder="seu@email.com"
                  placeholderTextColor="#797984"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.inputBox}>
              <Text style={styles.inputBoxLabel}>SENHA</Text>
              <View style={styles.inputField}>
                <TextInput
                  style={styles.inputFieldInput}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor="#797984"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            <View style={styles.inputBox}>
              <Text style={styles.inputBoxLabel}>CONFIRMAR SENHA</Text>
              <View style={styles.inputField}>
                <TextInput
                  style={styles.inputFieldInput}
                  placeholder="Repita a senha"
                  placeholderTextColor="#797984"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>
          </View>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.actionButton, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#f8fafc" />
            ) : (
              <Text style={styles.actionButtonText}>Cadastrar</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerLinkContainer}>
            <Text style={styles.footerText}>Já tem uma conta? </Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.footerLink}>Fazer login</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    paddingHorizontal: 28,
    paddingVertical: 36,
    borderRadius: 16,
    gap: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 4,
  },
  formHeaderTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.ink,
  },
  formSubtitle: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 4,
  },
  inputs: {
    gap: 16,
  },
  inputBox: {
    gap: 6,
  },
  inputBoxLabel: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: colors.primary,
    paddingBottom: 4,
  },
  inputFieldInput: {
    flex: 1,
    fontSize: 16,
    color: colors.ink,
    paddingVertical: 8,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  errorBox: {
    backgroundColor: '#FFE5E5',
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
    padding: 12,
    borderRadius: 6,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  footerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    color: colors.muted,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});
