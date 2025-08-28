import { AuthForm } from '@/src/components/app/auth-form-simple';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <AuthForm mode="signin" />
    </div>
  );
}
