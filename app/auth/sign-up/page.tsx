import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { Eyebrow } from "@/components/ui/eyebrow";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false },
};

export default function SignUpPage() {
  return (
    <div className="container min-h-[80vh] flex items-center justify-center py-14">
      <div className="w-full max-w-md rounded-lg border border-ink/10 bg-card p-8 shadow-press">
        <Eyebrow tone="gold">New to Georgia Print Hub?</Eyebrow>
        <h1 className="heading-display mt-3 text-3xl">Create your account</h1>
        <p className="mt-2 text-sm text-ink-mute">
          Track orders, store designs and artwork, and reorder with one click.
        </p>
        <div className="mt-6">
          <SignUpForm />
        </div>
        <p className="mt-6 text-sm text-ink-mute text-center">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
