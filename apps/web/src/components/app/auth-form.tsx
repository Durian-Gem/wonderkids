'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Label } from '@/src/components/ui/label';
import { supabase } from '@/src/lib/supabase';

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignInData = z.infer<typeof signInSchema>;
type SignUpData = z.infer<typeof signUpSchema>;

interface AuthFormProps {
  mode: 'signin' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
  const t = useTranslations('auth');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const isSignUp = mode === 'signup';
  const schema = isSignUp ? signUpSchema : signInSchema;

  const form = useForm<SignInData | SignUpData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      ...(isSignUp && { confirmPassword: '' }),
    },
  });

  const onSubmit = async (data: SignInData | SignUpData) => {
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        });

        if (error) throw error;

        if (authData.user) {
          // Profile will be created automatically by database trigger
          router.push('/dashboard');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) throw error;
        router.push('/dashboard');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMagicLink = async () => {
    const email = form.getValues('email');
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
      setMagicLinkSent(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (magicLinkSent) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('checkYourEmail')}</CardTitle>
          <CardDescription>
            We've sent you a sign-in link. Please check your email.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{isSignUp ? t('signUpTitle') : t('signInTitle')}</CardTitle>
        <CardDescription>
          {isSignUp
            ? 'Create your account to get started'
            : 'Welcome back! Please sign in to continue'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              id="password"
              type="password"
              {...form.register('password')}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...form.register('confirmPassword')}
              />
              {isSignUp && 'confirmPassword' in form.formState.errors && form.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="space-y-2">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Loading...' : isSignUp ? t('signUpWithEmail') : t('signInWithEmail')}
            </Button>

            {!isSignUp && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={sendMagicLink}
                disabled={loading}
              >
                {t('magicLink')}
              </Button>
            )}
          </div>

          <div className="text-center text-sm">
            {isSignUp ? (
              <>
                {t('alreadyHaveAccount')}{' '}
                <a href="/auth/sign-in" className="text-primary hover:underline">
                  {t('signIn')}
                </a>
              </>
            ) : (
              <>
                {t('dontHaveAccount')}{' '}
                <a href="/auth/sign-up" className="text-primary hover:underline">
                  {t('signUp')}
                </a>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
