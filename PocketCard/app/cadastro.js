import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../config/firebase';

// Traduz o código de erro do Firebase para uma mensagem que o usuário entende
function mensagemDeErro(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado. Tente entrar.';
    case 'auth/invalid-email':
      return 'Formato de e-mail inválido.';
    case 'auth/weak-password':
      return 'A senha precisa ter pelo menos 6 caracteres.';
    case 'auth/network-request-failed':
      return 'Sem conexão. Verifique sua internet e tente de novo.';
    case 'auth/operation-not-allowed':
      return 'Cadastro por e-mail não está ativado no Firebase.';
    default:
      return 'Não foi possível criar a conta. Tente novamente.';
  }
}

export default function CadastroScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    // 1) Validações locais (antes de chamar o Firebase)
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      // 2) Cria a conta (o usuário já fica logado depois disso)
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);

      // 3) Salva o nome no perfil do usuário
      await updateProfile(credential.user, { displayName: name.trim() });

      // 4) Vai para o app
      router.replace('/(tabs)');
    } catch (error) {
      setErrorMessage(mensagemDeErro(error.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <View style={styles.formHeader}>
              <Text style={styles.formHeaderTitle}>Criar conta</Text>
            </View>

            <View style={styles.inputs}>
              <View style={styles.inputBox}>
                <Text style={styles.inputBoxLabel}>NOME</Text>
                <View style={styles.inputField}>
                  <TextInput
                    style={styles.inputFieldInput}
                    placeholder="Seu nome"
                    placeholderTextColor="#797984"
                    autoCapitalize="words"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

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
                    placeholder="Mínimo de 6 caracteres"
                    placeholderTextColor="#797984"
                    secureTextEntry
                    autoCapitalize="none"
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
                    autoCapitalize="none"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onSubmitEditing={handleRegister}
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
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#f8fafc" />
              ) : (
                <Text style={styles.buttonText}>Criar conta</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace('/login')} style={styles.linkBox}>
              <Text style={styles.linkText}>
                Já tem conta? <Text style={styles.linkTextBold}>Entrar</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6B7489',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  form: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 40,
    paddingVertical: 30,
    borderRadius: 8,
    gap: 30,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.336,
    shadowRadius: 8,
    elevation: 5,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formHeaderTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#312d37',
  },
  inputs: {
    gap: 20,
  },
  inputBox: {
    gap: 8,
  },
  inputBoxLabel: {
    fontSize: 14,
    color: '#797984',
    fontWeight: '600',
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#0f8b8d',
    paddingBottom: 4,
  },
  inputFieldInput: {
    flex: 1,
    fontSize: 18,
    color: '#312d37',
    paddingVertical: 4,
    // outlineStyle só existe no web; no celular seria ignorado
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  button: {
    backgroundColor: '#0f8b8d',
    padding: 14,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#f8fafc',
    fontWeight: 'bold',
    fontSize: 18,
  },
  errorBox: {
    backgroundColor: '#ffe5e5',
    borderLeftWidth: 4,
    borderLeftColor: '#ff4d4d',
    padding: 12,
    borderRadius: 4,
  },
  errorText: {
    color: '#d93838',
    fontSize: 14,
    fontWeight: '600',
  },
  linkBox: {
    alignItems: 'center',
  },
  linkText: {
    color: '#797984',
    fontSize: 15,
  },
  linkTextBold: {
    color: '#0f8b8d',
    fontWeight: 'bold',
  },
});