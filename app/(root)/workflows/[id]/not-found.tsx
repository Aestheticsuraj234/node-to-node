import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WorkflowNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h2 className="text-xl font-semibold">Workflow not found</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        This workflow may have been deleted or you don&apos;t have access to it.
      </p>
      <Button render={<Link href="/" />}>Back to workflows</Button>
    </main>
  );
}
