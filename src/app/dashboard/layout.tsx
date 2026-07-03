import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import React from "react";
import DashboardSidebar from "@/components/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.isAdmin) {
    redirect("/auth/login");
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] relative">
      <DashboardSidebar />
      <div className="flex-1 overflow-hidden bg-gray-100">{children}</div>
    </div>
  );
}

