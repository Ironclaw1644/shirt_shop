import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Eyebrow } from "@/components/ui/eyebrow";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="container min-h-[80vh] flex items-center justify-center py-14">
      <div className="w-full max-w-md rounded-lg border border-ink/10 bg-card p-8 shadow-press">
        <Eyebrow tone="crimson">Welcome back</Eyebrow>
        <h1 className="heading-display mt-3 text-3xl">Sign in</h1>
        <p className="mt-2 text-sm text-ink-mute">
          Sign in to track orders, download proofs, and reorder in one click.
        </p>
        <div className="mt-6">
          <SignInForm next={sp.next} />
        </div>
        <p className="mt-6 text-sm text-ink-mute text-center">
          New here?{" "}
          <Link href="/auth/sign-up" className="text-primary font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
