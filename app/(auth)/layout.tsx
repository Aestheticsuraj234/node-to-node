import { ModeToggle } from "@/components/ui/mode-toggle";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center p-6">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      {children}
    </div>
  );
}
