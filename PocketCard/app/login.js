import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

 const handleLogin = async () => {
    // Se faltar e-mail ou senha, define a mensagem e interrompe a execução
    if (!email || !password) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      setErrorMessage(''); // Limpa erros anteriores
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/(tabs)');
    } catch (error) {
      let msg = 'Usuário ou senha invalidos';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        msg = 'E-mail ou senha inválidos.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Formato de e-mail inválido.';
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
      <View style={styles.loginForm}>
        <View style={styles.formHeader}>
          <Text style={styles.formHeaderTitle}>Login</Text>
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
                value={email}
                onChangeText={setEmail}
                outli
              />
            </View>
          </View>

          <View style={styles.inputBox}>
            <Text style={styles.inputBoxLabel}>SENHA</Text>
            <View style={styles.inputField}>
              <TextInput
                style={styles.inputFieldInput}
                placeholder="••••••••"
                placeholderTextColor="#797984"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>
        </View>
        {errorMessage ? (
            <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
) : null}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
    </>
    
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6B7489',
  },
  loginForm: {
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
    fontSize: 40,
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
    outlineStyle: 'none',
  },
  loginButton: {
    backgroundColor: '#0f8b8d',
    padding: 14,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  loginButtonText: {
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
});