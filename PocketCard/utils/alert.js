import { Alert as RNAlert, Platform } from 'react-native';

/**
 * Utilitário cross-platform para exibir confirmações e alertas.
 * No React Native Web, o Alert.alert não renderiza botões de ação (é no-op ou window.alert sem callbacks).
 */
export function confirmAction({
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  destructive = false,
  onConfirm,
  onCancel,
}) {
  if (Platform.OS === 'web') {
    const fullMessage = title ? `${title}\n\n${message || ''}` : message || '';
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      const ok = window.confirm(fullMessage);
      if (ok) {
        onConfirm?.();
      } else {
        onCancel?.();
      }
      return;
    }
  }

  RNAlert.alert(
    title,
    message,
    [
      {
        text: cancelText,
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: confirmText,
        style: destructive ? 'destructive' : 'default',
        onPress: onConfirm,
      },
    ],
    { cancelable: true }
  );
}

export function showAlert(title, message) {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.alert === 'function') {
    window.alert(title ? `${title}\n\n${message || ''}` : message || '');
    return;
  }
  RNAlert.alert(title, message);
}
