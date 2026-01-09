import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Head from "next/head";
import { Toaster } from "@/components/ui/sonner";
import { AuthInitializer } from "@/components/AuthInitializer";
import ReduxProvider from "@/store/ReduxProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vijad Projects",
  description: "Building Excellence and Creating Communities",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="/vijad-favicon.png" />
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        <ReduxProvider>
          <AuthInitializer>
            {children}
          </AuthInitializer>
        </ReduxProvider>
        <Toaster />
      </body>
    </html>
  );
}
