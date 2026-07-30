import type { Metadata } from "next";

import { EnvironmentIndicator } from "@/components/feedback/environment-indicator";
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
    <html lang="en" className={`${inter.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        {!isProductionEnvironment(environment) ? (
          <EnvironmentIndicator environment={environment.applicationEnvironment} />
        ) : null}
      </body>
    </html>
  );
}
