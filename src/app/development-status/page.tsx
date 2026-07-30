import { notFound } from "next/navigation";

import { getServerEnvironment, isProductionEnvironment } from "@/server/env";

export const dynamic = "force-dynamic";

export default function DevelopmentStatusPage() {
  const environment = getServerEnvironment();

  if (isProductionEnvironment(environment)) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-4 px-6 py-12">
      <p className="text-sm font-medium uppercase tracking-wide text-text-secondary">
        System diagnostic
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
        Development status
      </h1>
      <p className="text-base text-text-secondary">
        The application is running in the {environment.applicationEnvironment} environment.
      </p>
    </main>
  );
}
