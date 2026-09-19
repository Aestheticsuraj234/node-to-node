import { ModeToggle } from "@/components/ui/mode-toggle";
import { UserButton } from "@/modules/auth/components/user-button";
import { requireAuth } from "@/modules/auth/actions";
export default async function Home() {
  const user = await requireAuth();
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <ModeToggle />
      <UserButton user={user} />
    </div>
  );
}
