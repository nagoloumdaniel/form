import { AuthShell } from "@/components/auth/auth-shell";
import { FormSkeleton } from "@/components/auth/form-skeleton";

export default function Loading() {
  return (
    <AuthShell>
      <FormSkeleton />
    </AuthShell>
  );
}
