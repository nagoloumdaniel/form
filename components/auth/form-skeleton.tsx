export function FormSkeleton() {
  return (
    <div aria-hidden className="animate-pulse space-y-5">
      <div className="h-9 w-2/3 rounded bg-line" />
      <div className="h-5 w-full rounded bg-line" />
      <div className="h-11 w-full rounded-lg bg-line" />
      <div className="h-12 w-full rounded-lg bg-line" />
      <div className="h-11 w-full rounded-lg bg-line" />
    </div>
  );
}
