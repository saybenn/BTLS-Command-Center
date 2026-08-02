import type { Metadata } from "next";

import { EnvironmentIndicator } from "@/components/feedback/environment-indicator";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { themeInitializerScript } from "@/components/theme/theme-script";
import { getServerEnvironment, isProductionEnvironment } from "@/server/env";

import { inter } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "BTLS Command Center",
  description: "Operations and web growth in one focused workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const environment = getServerEnvironment();

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializerScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
        {!isProductionEnvironment(environment) ? (
          <EnvironmentIndicator environment={environment.applicationEnvironment} />
        ) : null}
      </body>
    </html>
  );
}
