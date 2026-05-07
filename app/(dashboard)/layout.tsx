"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import SideNav from "@/components/ui/SideNav";
import TopBar from "@/components/ui/TopBar";
import { AuthProvider, AuthUser } from "@/contexts/AuthContext";

interface MeResponse {
  success: boolean;
  data?: {
    user: AuthUser;
    companyName: string;
  };
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    async function fetchMe() {
      const response = await fetch("/api/auth/me");
      const payload = (await response.json()) as MeResponse;

      if (!response.ok || !payload.success || !payload.data?.user) {
        router.push("/login");
        return;
      }

      setUser(payload.data.user);
      setCompanyName(payload.data.companyName);
      setLoading(false);
    }

    fetchMe();
  }, [router]);

  if (loading || !user) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <AuthProvider value={{ user, companyName }}>
      <TopBar companyName={companyName} userName={user.name} />
      <SideNav />
      <main className="pt-20 md:pl-60">
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </AuthProvider>
  );
}
