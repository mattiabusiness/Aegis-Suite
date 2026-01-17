// ============================================================================
// AEGIS SUITE - LOGIN FORM COMPONENT
// File: packages/ui/src/components/auth/LoginForm.tsx
// ============================================================================

'use client';

import * as React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert } from '../ui/alert';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';

// ============================================================================
// TYPES
// ============================================================================

export interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => Promise<void>;
  onForgotPassword?: () => void;
  onRegister?: () => void;
  logo?: React.ReactNode;
  title?: string;
  description?: string;
  registerText?: string;
  registerLinkText?: string;
  forgotPasswordText?: string;
  submitText?: string;
  error?: string;
  success?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function LoginForm({
  onSubmit,
  onForgotPassword,
  onRegister,
  logo,
  title = 'Accedi',
  description = 'Inserisci le tue credenziali per accedere',
  registerText = 'Non hai un account?',
  registerLinkText = 'Registrati',
  forgotPasswordText = 'Password dimenticata?',
  submitText = 'Accedi',
  error,
  success,
}: LoginFormProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [formError, setFormError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validazione base
    if (!email) {
      setFormError('Inserisci la tua email');
      return;
    }
    if (!password) {
      setFormError('Inserisci la password');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ email, password });
    } catch {
      setFormError('Errore durante il login. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const displayError = error || formError;

  return (
    <Card className="w-full max-w-md mx-auto" padding="lg">
      <CardHeader className="text-center">
        {logo && <div className="mb-6 flex justify-center">{logo}</div>}
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        {displayError && (
          <Alert variant="error" className="mb-4">
            {displayError}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-4">
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email"
            placeholder="nome@esempio.it"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {onForgotPassword && (
            <div className="text-right">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-purple-600 hover:text-purple-700 hover:underline"
              >
                {forgotPasswordText}
              </button>
            </div>
          )}

          <Button type="submit" fullWidth loading={loading}>
            {submitText}
          </Button>
        </form>
      </CardContent>

      {onRegister && (
        <CardFooter className="text-center">
          <p className="text-gray-600">
            {registerText}{' '}
            <button
              type="button"
              onClick={onRegister}
              className="text-purple-600 hover:text-purple-700 font-medium hover:underline"
            >
              {registerLinkText}
            </button>
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
