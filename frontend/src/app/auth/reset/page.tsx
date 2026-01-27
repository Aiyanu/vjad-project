// src/app/auth/reset/page.tsx
// This page handles the reset password flow from the forgot-password email link
// It's identical to reset-password but at a different route for better UX

import { redirect } from "next/navigation";

export default function ResetPage() {
    // This page will redirect to the reset-password page which handles the actual logic
    // Or we can move the reset-password logic here
    redirect("/auth/reset-password");
}
