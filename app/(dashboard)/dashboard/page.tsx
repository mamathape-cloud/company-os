"use client";

import ModuleCard from "@/components/ui/ModuleCard";
import StatTile from "@/components/ui/StatTile";
import { useAuth } from "@/contexts/AuthContext";

function getGreetingByHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardHome() {
  const { user } = useAuth();
  const greeting = getGreetingByHour(new Date().getHours());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">
        {greeting}, {user.name}
      </h1>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ModuleCard title="Company" subtitle="HR, Finance, Attendance, Users" href="/company" />
        <ModuleCard title="Projects" subtitle="Clients, Invoices, Tasks" href="/projects" />
        <ModuleCard title="Vendors" subtitle="Contracts, Invoices, Payments" href="/vendors" />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Open Invoices" value="--" />
        <StatTile label="Upcoming Renewals" value="--" />
        <StatTile label="Pending Tasks" value="--" />
        <StatTile label="Present Today" value="--" />
      </section>
    </div>
  );
}
