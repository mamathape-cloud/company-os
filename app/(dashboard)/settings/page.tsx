"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from "@mui/material";
import toast from "react-hot-toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/ui/PageHeader";
import { companySchema, CompanyInput } from "@/lib/validations/company";

const industryOptions = ["IT Services", "Manufacturing", "Retail", "Healthcare", "Other"];
const companyTypeOptions = ["Private Ltd", "LLP", "Sole Proprietorship", "Partnership"];
const monthOptions = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
const currencyOptions = ["INR", "USD", "EUR", "GBP"];
const timezoneOptions = ["Asia/Kolkata", "UTC", "Europe/London", "America/New_York", "Asia/Dubai"];
const dateFormatOptions = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];

interface CompanyResponse {
  success: boolean;
  data?: CompanyInput;
  error?: string;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm<CompanyInput>({
    resolver: zodResolver(companySchema),
    mode: "onBlur"
  });

  useEffect(() => {
    async function fetchCompany() {
      try {
        const response = await fetch("/api/company");
        const payload = (await response.json()) as CompanyResponse;
        if (response.ok && payload.success && payload.data) {
          reset({
            name: payload.data.name ?? "",
            logo: payload.data.logo ?? "",
            industry: payload.data.industry ?? "",
            companyType: payload.data.companyType ?? "",
            gst: payload.data.gst ?? "",
            pan: payload.data.pan ?? "",
            cin: payload.data.cin ?? "",
            financialYearStart: payload.data.financialYearStart ?? "April",
            address: payload.data.address ?? "",
            city: payload.data.city ?? "",
            state: payload.data.state ?? "",
            pincode: payload.data.pincode ?? "",
            email: payload.data.email ?? "",
            phone: payload.data.phone ?? "",
            website: payload.data.website ?? "",
            invoicePrefix: payload.data.invoicePrefix ?? "INV-",
            currency: payload.data.currency ?? "INR",
            timezone: payload.data.timezone ?? "Asia/Kolkata",
            dateFormat: payload.data.dateFormat ?? "DD/MM/YYYY"
          });
        } else {
          toast.error(payload.error ?? "Failed to load company settings");
        }
      } catch {
        toast.error("Failed to load company settings");
      } finally {
        setLoading(false);
      }
    }

    fetchCompany();
  }, [reset]);

  async function onSubmit(values: CompanyInput) {
    setSaving(true);
    try {
      const response = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      const payload = (await response.json()) as CompanyResponse;

      if (!response.ok || !payload.success) {
        toast.error(payload.error ?? "Failed to save settings");
        return;
      }

      toast.success("Settings saved");
      if (payload.data) {
        reset(payload.data);
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your company profile and preferences" />

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <Section title="Company Identity">
          <TextField
            label="Company Name"
            fullWidth
            {...register("name")}
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
          />
          <TextField
            label="Logo URL"
            fullWidth
            {...register("logo")}
            error={Boolean(errors.logo)}
            helperText={errors.logo?.message ?? "Optional URL to your company logo"}
          />
          <FormControl fullWidth error={Boolean(errors.industry)}>
            <InputLabel>Industry Type</InputLabel>
            <Select
              label="Industry Type"
              value={watch("industry") ?? ""}
              onChange={(e) => setValue("industry", e.target.value, { shouldValidate: true, shouldDirty: true })}
            >
              {industryOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.industry?.message}</FormHelperText>
          </FormControl>
          <FormControl fullWidth error={Boolean(errors.companyType)}>
            <InputLabel>Company Type</InputLabel>
            <Select
              label="Company Type"
              value={watch("companyType") ?? ""}
              onChange={(e) => setValue("companyType", e.target.value, { shouldValidate: true, shouldDirty: true })}
            >
              {companyTypeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.companyType?.message}</FormHelperText>
          </FormControl>
        </Section>

        <Section title="Registration & Tax">
          <TextField
            label="GST Number"
            fullWidth
            {...register("gst")}
            error={Boolean(errors.gst)}
            helperText={errors.gst?.message}
          />
          <TextField
            label="PAN Number"
            fullWidth
            {...register("pan")}
            error={Boolean(errors.pan)}
            helperText={errors.pan?.message}
          />
          <TextField
            label="CIN Number"
            fullWidth
            {...register("cin")}
            error={Boolean(errors.cin)}
            helperText={errors.cin?.message}
          />
          <FormControl fullWidth error={Boolean(errors.financialYearStart)}>
            <InputLabel>Financial Year Start</InputLabel>
            <Select
              label="Financial Year Start"
              value={watch("financialYearStart") ?? "April"}
              onChange={(e) =>
                setValue("financialYearStart", e.target.value, { shouldValidate: true, shouldDirty: true })
              }
            >
              {monthOptions.map((month) => (
                <MenuItem key={month} value={month}>
                  {month}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.financialYearStart?.message}</FormHelperText>
          </FormControl>
        </Section>

        <Section title="Contact & Location">
          <TextField
            label="Registered Address"
            fullWidth
            multiline
            minRows={3}
            {...register("address")}
            error={Boolean(errors.address)}
            helperText={errors.address?.message}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <TextField label="City" {...register("city")} error={Boolean(errors.city)} helperText={errors.city?.message} />
            <TextField label="State" {...register("state")} error={Boolean(errors.state)} helperText={errors.state?.message} />
            <TextField
              label="Pincode"
              {...register("pincode")}
              error={Boolean(errors.pincode)}
              helperText={errors.pincode?.message}
            />
          </div>
          <TextField
            label="Business Email"
            fullWidth
            {...register("email")}
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
          />
          <TextField
            label="Business Phone"
            fullWidth
            {...register("phone")}
            error={Boolean(errors.phone)}
            helperText={errors.phone?.message}
          />
          <TextField
            label="Website"
            fullWidth
            {...register("website")}
            error={Boolean(errors.website)}
            helperText={errors.website?.message}
          />
        </Section>

        <Section title="Preferences">
          <TextField
            label="Invoice Prefix"
            fullWidth
            {...register("invoicePrefix")}
            error={Boolean(errors.invoicePrefix)}
            helperText={errors.invoicePrefix?.message}
          />
          <FormControl fullWidth error={Boolean(errors.currency)}>
            <InputLabel>Currency</InputLabel>
            <Select
              label="Currency"
              value={watch("currency") ?? "INR"}
              onChange={(e) => setValue("currency", e.target.value, { shouldValidate: true, shouldDirty: true })}
            >
              {currencyOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.currency?.message}</FormHelperText>
          </FormControl>
          <FormControl fullWidth error={Boolean(errors.timezone)}>
            <InputLabel>Timezone</InputLabel>
            <Select
              label="Timezone"
              value={watch("timezone") ?? "Asia/Kolkata"}
              onChange={(e) => setValue("timezone", e.target.value, { shouldValidate: true, shouldDirty: true })}
            >
              {timezoneOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.timezone?.message}</FormHelperText>
          </FormControl>
          <FormControl fullWidth error={Boolean(errors.dateFormat)}>
            <InputLabel>Date Format</InputLabel>
            <Select
              label="Date Format"
              value={watch("dateFormat") ?? "DD/MM/YYYY"}
              onChange={(e) => setValue("dateFormat", e.target.value, { shouldValidate: true, shouldDirty: true })}
            >
              {dateFormatOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.dateFormat?.message}</FormHelperText>
          </FormControl>
        </Section>

        <div className="flex justify-end">
          <Button type="submit" variant="contained" disabled={saving || !isDirty}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
