import type { Metadata } from "next";
import { AppPrivyProvider } from "@/providers/PrivyProvider";
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
  return (
    <html lang="en">
      <body className="antialiased bg-black text-white">
        <AppPrivyProvider>
          <AuthGate>{children}</AuthGate>
        </AppPrivyProvider>
      </body>
    </html>
  );
}
