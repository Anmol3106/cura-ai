import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import "./theme.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Cura AI | Your Personal AI Health Companion",
  description:
    "Cura AI helps you understand general health information in simple language. Educational use only, not a substitute for professional medical advice.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className={manrope.className}>{children}</body>
    </html>
  );
}
