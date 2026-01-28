// src/services/contactService.ts
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function sendContactMessage(formData: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}) {
  const url = `${BASE_URL}/contact`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || data?.error || "Request failed");
  }
  return res.json();
}
