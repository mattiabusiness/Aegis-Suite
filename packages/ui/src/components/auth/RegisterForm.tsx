// ============================================================================
// AEGIS SUITE - REGISTER FORM COMPONENT
// File: packages/ui/src/components/auth/RegisterForm.tsx
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

export interface RegisterFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  onLogin?: () => void;
  onTermsClick?: () => void;
  onPrivacyClick?: () => void;
  logo?: React.ReactNode;
  title?: string;
  description?: string;
  loginText?: string;
  loginLinkText?: string;
  submitText?: string;
  termsUrl?: string;
  privacyUrl?: string;
  error?: string;
  success?: string;
  showPhone?: boolean;
  // Initial values for pre-filling (e.g., from invite)
  initialName?: string;
  initialEmail?: string;
  initialPhone?: string;
  // Lock email field (for invited users) - DEPRECATED: use inviteMode instead
  emailReadOnly?: boolean;
  // ================================================================
  // NUOVO: Invite mode - blocca tutti i campi precompilati e nasconde link login
  // ================================================================
  inviteMode?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function RegisterForm({
  onSubmit,
  onLogin,
  onTermsClick,
  onPrivacyClick,
  logo,
  title = 'Crea il tuo account',
  description = 'Registrati per iniziare',
  loginText = 'Hai già un account?',
  loginLinkText = 'Accedi',
  submitText = 'Registrati',
  termsUrl,
  privacyUrl,
  error,
  success,
  showPhone = true,
  initialName = '',
  initialEmail = '',
  initialPhone = '',
  emailReadOnly = false,
  inviteMode = false,
}: RegisterFormProps) {
  const [fullName, setFullName] = React.useState(initialName);
  const [email, setEmail] = React.useState(initialEmail);
  const [phone, setPhone] = React.useState(initialPhone);
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [formError, setFormError] = React.useState('');

  // In invite mode, all pre-filled fields are read-only
  const isNameReadOnly = inviteMode && !!initialName;
  const isEmailReadOnly = inviteMode || emailReadOnly;
  const isPhoneReadOnly = inviteMode && !!initialPhone;

  // Update state when initial values change
  React.useEffect(() => {
    if (initialName) setFullName(initialName);
  }, [initialName]);
  
  React.useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);
  
  React.useEffect(() => {
    if (initialPhone) setPhone(initialPhone);
  }, [initialPhone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validazioni
    if (!fullName.trim()) {
      setFormError('Inserisci il tuo nome');
      return;
    }
    if (!email) {
      setFormError('Inserisci la tua email');
      return;
    }
    if (showPhone && !phone.trim()) {
      setFormError('Inserisci il tuo numero di telefono');
      return;
    }
    if (!password) {
      setFormError('Inserisci una password');
      return;
    }
    if (password.length < 8) {
      setFormError('La password deve avere almeno 8 caratteri');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Le password non corrispondono');
      return;
    }
    if (!acceptedTerms) {
      setFormError('Devi accettare i Termini di Servizio e la Privacy Policy');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ fullName, email, phone, password });
    } catch {
      setFormError('Errore durante la registrazione. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const handleTermsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onTermsClick) {
      onTermsClick();
    } else if (termsUrl) {
      window.open(termsUrl, '_blank');
    }
  };

  const handlePrivacyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onPrivacyClick) {
      onPrivacyClick();
    } else if (privacyUrl) {
      window.open(privacyUrl, '_blank');
    }
  };

  const displayError = error || formError;

  // Stile per campi read-only
  const readOnlyClassName = 'bg-gray-100 cursor-not-allowed';

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
            type="text"
            label="Nome completo"
            placeholder="Mario Rossi"
            value={fullName}
            onChange={(e) => !isNameReadOnly && setFullName(e.target.value)}
            autoComplete="name"
            required
            disabled={isNameReadOnly}
            className={isNameReadOnly ? readOnlyClassName : ''}
          />

          <Input
            type="email"
            label="Email"
            placeholder="nome@esempio.it"
            value={email}
            onChange={(e) => !isEmailReadOnly && setEmail(e.target.value)}
            autoComplete="email"
            required
            disabled={isEmailReadOnly}
            className={isEmailReadOnly ? readOnlyClassName : ''}
          />

          {showPhone && (
            <Input
              type="tel"
              label="Telefono"
              placeholder="+39 333 1234567"
              value={phone}
              onChange={(e) => !isPhoneReadOnly && setPhone(e.target.value)}
              autoComplete="tel"
              hint="Per ricevere promemoria appuntamenti"
              required
              disabled={isPhoneReadOnly}
              className={isPhoneReadOnly ? readOnlyClassName : ''}
            />
          )}

          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            hint="Minimo 8 caratteri"
            required
          />

          <Input
            type="password"
            label="Conferma password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          {/* Checkbox Termini e Privacy */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="acceptTerms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
            />
            <label htmlFor="acceptTerms" className="text-sm text-gray-600 cursor-pointer">
              Accetto i{' '}
              <button
                type="button"
                onClick={handleTermsClick}
                className="text-purple-600 hover:text-purple-700 font-medium hover:underline"
              >
                Termini di Servizio
              </button>
              {' '}e la{' '}
              <button
                type="button"
                onClick={handlePrivacyClick}
                className="text-purple-600 hover:text-purple-700 font-medium hover:underline"
              >
                Privacy Policy
              </button>
            </label>
          </div>

          <Button type="submit" fullWidth loading={loading}>
            {submitText}
          </Button>
        </form>
      </CardContent>

      {/* Nasconde il link "Accedi" quando in inviteMode */}
      {onLogin && !inviteMode && (
        <CardFooter className="text-center">
          <p className="text-gray-600">
            {loginText}{' '}
            <button
              type="button"
              onClick={onLogin}
              className="text-purple-600 hover:text-purple-700 font-medium hover:underline"
            >
              {loginLinkText}
            </button>
          </p>
        </CardFooter>
      )}
    </Card>
  );
}