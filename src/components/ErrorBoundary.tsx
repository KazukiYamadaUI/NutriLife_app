import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tokens } from '@/theme/tokens';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: tokens.bg,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
          }}
        >
          <Text style={{ fontSize: 48, marginBottom: 16 }}>😵</Text>
          <Text
            style={{
              fontSize: tokens.fontTitle,
              fontWeight: '800',
              color: tokens.text,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            問題が発生しました
          </Text>
          <Text
            style={{
              fontSize: tokens.fontBody,
              color: tokens.textMuted,
              textAlign: 'center',
              lineHeight: 28,
              marginBottom: 24,
            }}
          >
            予期しないエラーが発生しました。{'\n'}
            もう一度お試しください。
          </Text>
          <TouchableOpacity
            onPress={this.handleRetry}
            style={{
              backgroundColor: tokens.green,
              paddingVertical: 14,
              paddingHorizontal: 32,
              borderRadius: tokens.radiusSm,
              minHeight: tokens.touchMin,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontSize: tokens.fontLarge,
                fontWeight: '700',
              }}
            >
              もう一度試す
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}
