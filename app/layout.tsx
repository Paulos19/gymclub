import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import { Toaster } from "@/components/ui/sonner";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GymClub • A Elite dos Seus Treinos, Cargas & Coach IA",
  description:
    "Acompanhe seus treinos de musculação, registre a evolução de carga com precisão, guarde suas fotos de recordação e monte rotinas personalizadas com IA de alta performance.",
  keywords: [
    "musculação",
    "treino de academia",
    "evolução de carga",
    "diário de treino",
    "coach IA",
    "fitness",
    "academia",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${fontSans.variable} font-sans antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

