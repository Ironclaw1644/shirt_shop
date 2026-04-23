import { AdminPageHeader } from "@/components/admin/page-header";
import { CampaignForm } from "@/components/admin/campaign-form";

export default function NewCampaignPage() {
  return (
    <div>
      <AdminPageHeader title="New campaign" subtitle="Compose and send via Resend Broadcasts." />
      <div className="p-6 sm:p-8 max-w-3xl">
        <CampaignForm />
      </div>
    </div>
  );
}
