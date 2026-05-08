"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Alert, Button, CircularProgress, IconButton, InputAdornment, TextField } from "@mui/material";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import AppIcon from "@/components/ui/AppIcon";
import SplashScreen from "@/components/ui/SplashScreen";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required")
});

type LoginInput = z.infer<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryToastShownRef = useRef(false);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [splashMessage, setSplashMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginInput>({ resolver: zodResolver(schema), mode: "onBlur" });

  useEffect(() => {
    if (queryToastShownRef.current) {
      return;
    }
    const notice = searchParams.get("notice");
    const reset = searchParams.get("reset");
    if (notice === "company_exists") {
      toast.error("Company already configured. Please log in.");
      queryToastShownRef.current = true;
    } else if (reset === "success") {
      toast.success("Password reset successful. Please log in.");
      queryToastShownRef.current = true;
    }
  }, [searchParams]);

  async function onSubmit(values: LoginInput) {
    setLoading(true);
    setErrorMessage("");
    try {
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      const loginPayload = (await loginRes.json()) as { success: boolean };
      if (!loginRes.ok || !loginPayload.success) {
        setErrorMessage("Invalid email or password");
        setLoading(false);
        return;
      }

      const splashShown = localStorage.getItem("splash_shown");
      if (!splashShown || splashShown === "false") {
        setSplashMessage("Welcome to CompanyOS");
        return;
      }

      const meRes = await fetch("/api/auth/me");
      const mePayload = (await meRes.json()) as { data?: { companyName?: string } };
      setSplashMessage(`Welcome back, ${mePayload.data?.companyName ?? "CompanyOS"}`);
    } catch {
      setErrorMessage("Invalid email or password");
      setLoading(false);
    }
  }

  if (splashMessage) {
    return (
      <SplashScreen
        message={splashMessage}
        onComplete={() => {
          localStorage.setItem("splash_shown", "true");
          router.push("/dashboard");
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-3">
          <AppIcon size={48} />
          <h1 className="text-xl font-semibold text-slate-900">Sign in to CompanyOS</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <TextField label="Email" fullWidth {...register("email")} error={Boolean(errors.email)} helperText={errors.email?.message} />
          <TextField
            label="Password"
            fullWidth
            type={showPassword ? "text" : "password"}
            {...register("password")}
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((prev) => !prev)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
          <Button type="submit" variant="contained" fullWidth disabled={loading}>
            {loading ? <CircularProgress size={20} color="inherit" /> : "Login"}
          </Button>
        </form>

        <p className="mt-4 text-center">
          <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </p>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <CircularProgress color="primary" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
