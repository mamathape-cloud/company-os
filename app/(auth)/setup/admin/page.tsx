"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { TextField, Button, InputAdornment, IconButton } from "@mui/material";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { userSchema, UserInput } from "@/lib/validations/user";

function getPasswordStrength(password: string): "Weak" | "Medium" | "Strong" {
  const score =
    Number(password.length >= 8) + Number(/[A-Z]/.test(password)) + Number(/[0-9]/.test(password)) + Number(/[^A-Za-z0-9]/.test(password));
  if (score >= 4) return "Strong";
  if (score >= 3) return "Medium";
  return "Weak";
}

export default function AdminSetupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<UserInput>({
    resolver: zodResolver(userSchema),
    mode: "onBlur"
  });

  const passwordValue = watch("password") ?? "";
  const strength = useMemo(() => getPasswordStrength(passwordValue), [passwordValue]);

  async function onSubmit(values: UserInput) {
    try {
      const response = await fetch("/api/setup/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      const payload = (await response.json()) as { success: boolean; error?: string };
      if (!response.ok || !payload.success) {
        toast.error(payload.error ?? "Failed to create admin user");
        return;
      }

      localStorage.setItem("splash_shown", "false");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to create admin user");
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto w-full max-w-xl rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Create Admin Account</h1>
        <p className="mt-1 text-sm text-slate-500">Set up your superadmin credentials.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <TextField label="Full Name" fullWidth {...register("name")} error={Boolean(errors.name)} helperText={errors.name?.message} />
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
          <p className="text-xs text-slate-500">Password strength: {strength}</p>
          <TextField
            label="Confirm Password"
            fullWidth
            type={showConfirmPassword ? "text" : "password"}
            {...register("confirmPassword")}
            error={Boolean(errors.confirmPassword)}
            helperText={errors.confirmPassword?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword((prev) => !prev)}>
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <TextField label="Mobile Number" fullWidth {...register("mobile")} error={Boolean(errors.mobile)} helperText={errors.mobile?.message} />
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Create Admin and Continue
          </Button>
        </form>
      </div>
    </div>
  );
}
