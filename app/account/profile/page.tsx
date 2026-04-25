import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { updateProfile } from "@/app/account/profile/actions";

export default async function ProfilePage() {
  const supa = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supa
    .from("profiles")
    .select("full_name, company, phone")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div>
      <Eyebrow tone="ink">Profile</Eyebrow>
      <h1 className="heading-display mt-2 text-3xl sm:text-4xl">Your details</h1>

      <form action={updateProfile} className="mt-8 max-w-lg rounded-lg border border-ink/10 bg-card p-4 sm:p-6 space-y-4 shadow-press">
        <div>
          <Label className="block mb-1">Full name</Label>
          <Input name="full_name" defaultValue={profile?.full_name ?? ""} />
        </div>
        <div>
          <Label className="block mb-1">Company</Label>
          <Input name="company" defaultValue={profile?.company ?? ""} />
        </div>
        <div>
          <Label className="block mb-1">Phone</Label>
          <Input name="phone" type="tel" defaultValue={profile?.phone ?? ""} />
        </div>
        <Button type="submit">Save changes</Button>
      </form>
    </div>
  );
}
