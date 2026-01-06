"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import AuthForm from "@/components/auth/AuthForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 flex-col gap-8">
      <Link href="/" className="flex items-center gap-3">
        <Image src="/vjad-projects.png" width={160} height={50} alt="vjad" />
      </Link>

      <AuthForm
        mode="register"
        registerEndpoint="/api/auth/register"
        // for register you might want to redirect to verify-email page instead
        redirectTo="/verify-email"
      />
    </div>
  );
}
