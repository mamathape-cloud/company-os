"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField, Button } from "@mui/material";
import toast from "react-hot-toast";
import AppIcon from "@/components/ui/AppIcon";
import { forgotPasswordSchema } from "@/lib/validations/user";
import type { z } from "zod";

type ForgotInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ForgotInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur"
  });

  async function onSubmit(values: ForgotInput) {
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      const payload = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !payload.success) {
        toast.error(payload.error ?? "Something went wrong");
        return;
      }

      toast.success("If this email exists you will receive a reset link shortly");
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-3">
          <AppIcon size={48} />
          <h1 className="text-xl font-semibold text-slate-900">Forgot password</h1>
          <p className="text-center text-sm text-slate-500">Enter your account email. We will send a reset link if the account exists.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <TextField label="Email" fullWidth {...register("email")} error={Boolean(errors.email)} helperText={errors.email?.message} />
          <Button type="submit" variant="contained" fullWidth disabled={isSubmitting}>
            Send reset link
          </Button>
        </form>

        <p className="mt-4 text-center">
          <Link href="/login" className="text-sm font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
