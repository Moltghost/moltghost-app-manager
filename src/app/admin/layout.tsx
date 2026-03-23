import type { Metadata } from "next";
import { AuthGate } from "@/components/auth/AuthGate";

export const metadata: Metadata = {
  title: "Admin Dashboard - MOLTGHOST",
  description: "Admin dashboard for managing users and deployments",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGate>{children}</AuthGate>;
}
