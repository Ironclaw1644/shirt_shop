"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const client = getSupabaseBrowserClient();
    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/account`,
        },
      });
      if (error) throw error;
      if (data.session) {
        router.push("/account");
      } else {
        toast.success("Check your email", {
          description: "We sent a confirmation link to finish setup.",
        });
      }
    } catch (err) {
      toast.error("Sign-up failed", { description: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label htmlFor="full-name" className="mb-1 block">Full name</Label>
        <Input
          id="full-name"
          value={fullName}
          required
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
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
      <div>
        <Label htmlFor="password" className="mb-1 block">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          minLength={8}
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="mt-1 text-xs text-ink-mute">Minimum 8 characters.</p>
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}
