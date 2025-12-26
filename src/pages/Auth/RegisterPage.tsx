import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/common/ToastHost";
import type { RegisterRequest } from "../../features/auth/authApi";
import { useAuthStore } from "../../features/auth/authStore";

/**
 * Page component: RegisterPage.
 */
export default function RegisterPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { register, loading, error } = useAuthStore();

  const [form, setForm] = React.useState<RegisterRequest>({
    username: "",
    password: "",
    email: "",
    phone: "",
    gender: 0,
  });

  const onChange =
    (key: keyof RegisterRequest) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value =
        key === "gender" ? Number(e.target.value) : (e.target.value as any);
      setForm((p) => ({ ...p, [key]: value }));
    };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await register(form); 
      toast.success("Account created");
      navigate("/login", { replace: true });
    } catch {
      
      const msg = useAuthStore.getState().error ?? "Register failed";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-red-50">
      <div className="w-full max-w-md">
        <Card className="rounded-2xl">
          <CardHeader title="Create your account" subtitle="Join Tomato-Book" />

          <CardBody>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <div className="mb-1 text-sm font-medium text-neutral-700">
                  Username
                </div>
                <Input
                  value={form.username}
                  onChange={onChange("username")}
                  placeholder="Choose a username"
                  autoComplete="username"
                />
              </div>

              <div>
                <div className="mb-1 text-sm font-medium text-neutral-700">
                  Email
                </div>
                <Input
                  value={form.email}
                  onChange={onChange("email")}
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>

              <div>
                <div className="mb-1 text-sm font-medium text-neutral-700">
                  Phone
                </div>
                <Input
                  value={form.phone}
                  onChange={onChange("phone")}
                  placeholder="Enter your phone"
                  autoComplete="tel"
                />
              </div>

              <div>
                <div className="mb-1 text-sm font-medium text-neutral-700">
                  Gender
                </div>
                <select
                  value={form.gender}
                  onChange={onChange("gender")}
                  className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-200"
                >
                  <option value={0}>Prefer not to say</option>
                  <option value={1}>Male</option>
                  <option value={2}>Female</option>
                </select>
              </div>

              <div>
                <div className="mb-1 text-sm font-medium text-neutral-700">
                  Password
                </div>
                <Input
                  value={form.password}
                  onChange={onChange("password")}
                  type="password"
                  placeholder="Create a password"
                  autoComplete="new-password"
                />
              </div>

              {error ? (
                <div className="text-sm text-red-600 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
                  {error}
                </div>
              ) : null}

              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create account"}
              </Button>

              <div className="text-center text-sm text-neutral-600">
                Already have an account?{" "}
                <Link className="text-red-600 hover:text-red-700" to="/login">
                  Sign in
                </Link>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}