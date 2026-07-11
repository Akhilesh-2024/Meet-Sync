import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { loginRequest, registerRequest } from "../api/auth";
import { useAuthStore } from "../stores/authStore";

export function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = mode === "login" ? await loginRequest(email, password) : await registerRequest(email, password, name);
      setSession(res.user, res.accessToken);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-8">
      <h1 className="mb-1 text-xl font-bold text-gray-900">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
      <p className="mb-6 text-sm text-gray-500">
        {mode === "login" ? "Log in to manage your meetings." : "Start scheduling in seconds."}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "register" && (
          <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
        )}
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">
          {mode === "login" ? "Log in" : "Sign up"}
        </Button>
      </form>

      <button
        onClick={() => setMode(mode === "login" ? "register" : "login")}
        className="mt-6 w-full text-center text-sm text-brand-600 hover:underline"
      >
        {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
      </button>

      <p className="mt-4 text-center text-xs text-gray-400">
        Google OAuth login is available once GOOGLE_CLIENT_ID is configured on the backend (see README).
      </p>
    </Card>
  );
}
