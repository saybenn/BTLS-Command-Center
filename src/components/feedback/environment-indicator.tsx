type EnvironmentIndicatorProps = {
  environment: "development" | "staging" | "test";
};

export function EnvironmentIndicator({ environment }: EnvironmentIndicatorProps) {
  return (
    <p className="fixed bottom-4 right-4 z-50 rounded-full border border-border bg-surface-raised px-3 py-1 text-xs font-semibold uppercase tracking-wide text-text-secondary shadow-xs">
      {environment} environment
    </p>
  );
}
