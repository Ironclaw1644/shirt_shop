import { AdminPageHeader } from "@/components/admin/page-header";
import { CampaignForm } from "@/components/admin/campaign-form";

export default function NewCampaignPage() {
  return (
    <div>
      <AdminPageHeader title="New campaign" subtitle="Compose and send via Resend Broadcasts." />
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
        <CampaignForm />
      </div>
    </div>
  );
}
