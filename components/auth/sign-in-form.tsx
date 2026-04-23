"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignInForm({ next }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [mode, setMode] = React.useState<"password" | "magic">("magic");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const client = getSupabaseBrowserClient();
    try {
      if (mode === "magic") {
        const { error } = await client.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next ?? "/account")}` },
        });
        if (error) throw error;
        toast.success("Magic link sent", { description: "Check your email to sign in." });
      } else {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(next ?? "/account");
      }
    } catch (err) {
      toast.error("Sign-in failed", { description: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label htmlFor="email" className="mb-1 block">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      {mode === "password" && (
        <div>
          <Label htmlFor="password" className="mb-1 block">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Sending…" : mode === "magic" ? "Email me a magic link" : "Sign in"}
        <Icon icon="arrow-right" />
      </Button>
      <button
        type="button"
        onClick={() => setMode(mode === "magic" ? "password" : "magic")}
        className="text-sm text-primary hover:underline w-full text-center"
      >
        {mode === "magic" ? "Use password instead" : "Use magic link instead"}
      </button>
    </form>
  );
}
