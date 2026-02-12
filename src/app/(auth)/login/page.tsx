import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Framewise Health</h1>
        <p className="text-muted-foreground">Physician Portal</p>
      </div>
      <LoginForm />
    </div>
  );
}
