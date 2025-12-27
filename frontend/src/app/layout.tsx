import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ment - AI-Powered n8n Workflow Automation",
  description: "Build automated n8n workflows with AI precision. Direct n8n integration, always-updated documentation, smart validation, and real-time monitoring.",
  keywords: ["n8n", "MCP", "automation", "workflows", "AI", "Ment"],
  authors: [{ name: "Ment Team" }],
  openGraph: {
    title: "Ment",
    description: "The Evolution From Frustration to Flow",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

