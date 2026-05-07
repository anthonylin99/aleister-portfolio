import type { Metadata } from "next";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { VisibilityProvider } from "@/lib/visibility-context";
import { AuthProvider } from "@/lib/auth-context";
import { PortfolioProvider } from "@/lib/portfolio-context";
import { ThemeProvider } from "@/lib/theme-context";
import { BitcoinRain } from "@/components/effects/BitcoinRain";
import { ThemeSettings } from "@/components/ui/ThemeSettings";
import { ConditionalEffects } from "@/components/layout/ConditionalEffects";

export const metadata: Metadata = {
  title: "Aleister | Portfolio Tracker Demo",
  description: "A sample ETF-style portfolio tracker showcasing thesis workflows across Space, Crypto, Fintech, and AI sectors.",
  keywords: ["portfolio", "ETF", "investing", "crypto", "fintech", "AI", "space"],
  authors: [{ name: "Aleister" }],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Aleister",
    description: "Portfolio tracker demo with sample public data",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-gradient-radial min-h-screen antialiased noise-overlay">
        <AuthProvider>
          <ThemeProvider>
            <VisibilityProvider>
              <PortfolioProvider>
                <ConditionalEffects />
                
                <LayoutWrapper>
                  {children}
                </LayoutWrapper>
                
                {/* Theme Settings Button */}
                <ThemeSettings />
              </PortfolioProvider>
            </VisibilityProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
