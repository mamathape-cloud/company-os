"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { companySchema, CompanyInput } from "@/lib/validations/company";
import {
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  TextField
} from "@mui/material";
import Image from "next/image";

const stepFields: Array<Array<keyof CompanyInput>> = [
  ["name", "logo", "industry", "companyType"],
  ["gst", "pan", "cin", "financialYearStart"],
  ["address", "city", "state", "pincode", "email", "phone", "website"],
  ["invoicePrefix", "currency", "timezone", "dateFormat"]
];

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<CompanyInput>({
    resolver: zodResolver(companySchema),
    mode: "onBlur",
    defaultValues: {
      financialYearStart: "April",
      invoicePrefix: "INV-",
      currency: "INR",
      timezone: "Asia/Kolkata",
      dateFormat: "DD/MM/YYYY"
    }
  });

  const progress = useMemo(() => ((step + 1) / 4) * 100, [step]);

  async function goNext() {
    const isValid = await trigger(stepFields[step]);
    if (isValid) {
      setStep((prev) => Math.min(prev + 1, 3));
    }
  }

  function goBack() {
    setStep((prev) => Math.max(prev - 1, 0));
  }

  async function onSubmit(values: CompanyInput) {
    try {
      const response = await fetch("/api/setup/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      const payload = (await response.json()) as { success: boolean; error?: string };
      if (!response.ok || !payload.success) {
        toast.error(payload.error ?? "Failed to configure company");
        return;
      }

      toast.success("Company configured successfully");
      router.push("/setup/admin");
    } catch {
      toast.error("Failed to configure company");
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto w-full max-w-3xl rounded-xl bg-white p-6 shadow-sm">
        <p className="mb-2 text-sm font-medium text-slate-600">Step {step + 1} of 4</p>
        <LinearProgress variant="determinate" value={progress} />

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {step === 0 && (
            <>
              <TextField
                label="Company Name"
                fullWidth
                {...register("name")}
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
              />
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wide">Logo Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-1 block w-full"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
                      toast.error("Please select an image under 2MB");
                      return;
                    }
                    const url = URL.createObjectURL(file);
                    setLogoPreview(url);
                    setValue("logo", url, { shouldValidate: true });
                  }}
                />
                {logoPreview ? (
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    width={56}
                    height={56}
                    unoptimized
                    className="mt-3 rounded-md"
                  />
                ) : null}
              </div>
              <FormControl fullWidth error={Boolean(errors.industry)}>
                <InputLabel>Industry Type</InputLabel>
                <Select label="Industry Type" value={watch("industry") ?? ""} onChange={(e) => setValue("industry", e.target.value, { shouldValidate: true })}>
                  {["IT Services", "Manufacturing", "Retail", "Healthcare", "Other"].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.industry?.message}</FormHelperText>
              </FormControl>
              <FormControl fullWidth error={Boolean(errors.companyType)}>
                <InputLabel>Company Type</InputLabel>
                <Select label="Company Type" value={watch("companyType") ?? ""} onChange={(e) => setValue("companyType", e.target.value, { shouldValidate: true })}>
                  {["Private Ltd", "LLP", "Sole Proprietorship", "Partnership"].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.companyType?.message}</FormHelperText>
              </FormControl>
            </>
          )}

          {step === 1 && (
            <>
              <TextField label="GST Number" fullWidth {...register("gst")} error={Boolean(errors.gst)} helperText={errors.gst?.message} />
              <TextField label="PAN Number" fullWidth {...register("pan")} error={Boolean(errors.pan)} helperText={errors.pan?.message} />
              <TextField label="CIN Number" fullWidth {...register("cin")} error={Boolean(errors.cin)} helperText={errors.cin?.message} />
              <FormControl fullWidth error={Boolean(errors.financialYearStart)}>
                <InputLabel>Financial Year Start</InputLabel>
                <Select label="Financial Year Start" value={watch("financialYearStart") ?? "April"} onChange={(e) => setValue("financialYearStart", e.target.value, { shouldValidate: true })}>
                  {["January","February","March","April","May","June","July","August","September","October","November","December"].map((month) => (
                    <MenuItem key={month} value={month}>{month}</MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.financialYearStart?.message}</FormHelperText>
              </FormControl>
            </>
          )}

          {step === 2 && (
            <>
              <TextField label="Registered Address" fullWidth multiline minRows={3} {...register("address")} error={Boolean(errors.address)} helperText={errors.address?.message} />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <TextField label="City" {...register("city")} error={Boolean(errors.city)} helperText={errors.city?.message} />
                <TextField label="State" {...register("state")} error={Boolean(errors.state)} helperText={errors.state?.message} />
                <TextField label="Pincode" {...register("pincode")} error={Boolean(errors.pincode)} helperText={errors.pincode?.message} />
              </div>
              <TextField label="Business Email" fullWidth {...register("email")} error={Boolean(errors.email)} helperText={errors.email?.message} />
              <TextField label="Business Phone" fullWidth {...register("phone")} error={Boolean(errors.phone)} helperText={errors.phone?.message} />
              <TextField label="Website" fullWidth {...register("website")} error={Boolean(errors.website)} helperText={errors.website?.message} />
            </>
          )}

          {step === 3 && (
            <>
              <TextField label="Invoice Prefix" fullWidth {...register("invoicePrefix")} error={Boolean(errors.invoicePrefix)} helperText={errors.invoicePrefix?.message} />
              <FormControl fullWidth error={Boolean(errors.currency)}>
                <InputLabel>Currency</InputLabel>
                <Select label="Currency" value={watch("currency") ?? "INR"} onChange={(e) => setValue("currency", e.target.value, { shouldValidate: true })}>
                  {["INR", "USD", "EUR", "GBP"].map((currency) => (
                    <MenuItem key={currency} value={currency}>{currency}</MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.currency?.message}</FormHelperText>
              </FormControl>
              <FormControl fullWidth error={Boolean(errors.timezone)}>
                <InputLabel>Timezone</InputLabel>
                <Select label="Timezone" value={watch("timezone") ?? "Asia/Kolkata"} onChange={(e) => setValue("timezone", e.target.value, { shouldValidate: true })}>
                  {["Asia/Kolkata", "UTC", "Europe/London", "America/New_York", "Asia/Dubai"].map((tz) => (
                    <MenuItem key={tz} value={tz}>{tz}</MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.timezone?.message}</FormHelperText>
              </FormControl>
              <FormControl fullWidth error={Boolean(errors.dateFormat)}>
                <InputLabel>Date Format</InputLabel>
                <Select label="Date Format" value={watch("dateFormat") ?? "DD/MM/YYYY"} onChange={(e) => setValue("dateFormat", e.target.value, { shouldValidate: true })}>
                  {["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"].map((fmt) => (
                    <MenuItem key={fmt} value={fmt}>{fmt}</MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.dateFormat?.message}</FormHelperText>
              </FormControl>
            </>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="outlined" disabled={step === 0} onClick={goBack}>
              Back
            </Button>
            {step < 3 ? (
              <Button variant="contained" onClick={goNext}>
                Next
              </Button>
            ) : (
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                Save and Continue
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
