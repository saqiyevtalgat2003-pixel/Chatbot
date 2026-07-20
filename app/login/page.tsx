import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-bold text-2xl text-ink mb-1 text-center">KZ Resume Admin</h1>
        <p className="text-sm text-muted text-center mb-8">Тек әкімшілер үшін</p>
        <LoginForm />
      </div>
    </div>
  );
}
