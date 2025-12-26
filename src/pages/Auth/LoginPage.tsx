import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/common/ToastHost";
import type { LoginRequest } from "../../features/auth/authApi";
import { useAuthStore } from "../../features/auth/authStore";

/**
 * Page component: LoginPage.
 */
export default function LoginPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);

  const [form, setForm] = React.useState<LoginRequest>({
    username: "",
    password: "",
  });

  const onChange =
    (key: keyof LoginRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((p) => ({ ...p, [key]: e.target.value }));
    };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form);

      toast.success("Signed in");

      const s = location.state as any;
      const from = typeof s?.from === "string" ? s.from : "/dashboard";
      navigate(from, { replace: true });
    } catch {
      
      toast.error("Login failed");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-red-50">
      <div className="w-full max-w-md">
        <Card className="rounded-2xl">
          <CardHeader
            title="Welcome to Tomato-Book"
            subtitle="Sign in to continue"
          />

          <CardBody>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <div className="mb-1 text-sm font-medium text-neutral-700">
                  Account / Email
                </div>
                <Input
                  value={form.username}
                  onChange={onChange("username")}
                  placeholder="Enter your username or email"
                  autoComplete="username"
                />
              </div>

              <div>
                <div className="mb-1 text-sm font-medium text-neutral-700">
                  Password
                </div>
                <Input
                  value={form.password}
                  onChange={onChange("password")}
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>

              {error ? (
                <div className="text-sm text-red-600 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
                  {error}
                </div>
              ) : null}

              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>

              <div className="text-center text-sm text-neutral-600">
                Don&apos;t have an account?{" "}
                <Link
                  className="text-red-600 hover:text-red-700"
                  to="/register"
                >
                  Create one
                </Link>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}