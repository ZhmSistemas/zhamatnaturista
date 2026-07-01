import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import React from "react";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Si ya hay una sesión activa, no debe poder acceder a las rutas de auth (login, register), lo enviamos a "/"
  if (session) {
    redirect("/");
  }

  return <>{children}</>;
}
