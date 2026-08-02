import { notFound } from "next/navigation";

import { getServerEnvironment, isProductionEnvironment } from "@/server/env";

export const dynamic = "force-dynamic";

export default function DevelopmentStatusLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (isProductionEnvironment(getServerEnvironment())) {
    notFound();
  }

  return children;
}
