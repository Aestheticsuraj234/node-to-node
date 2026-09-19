import { SignInForm } from "@/modules/auth/components/sign-in-form";
import { requireUnauth } from "@/modules/auth/actions";

export default async function SignInPage() {
  await requireUnauth();

  return <SignInForm />;
}
