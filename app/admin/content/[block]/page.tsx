import { AdminPageHeader } from "@/components/admin/page-header";

export default async function ContentBlockEditor({ params }: { params: Promise<{ block: string }> }) {
  const { block } = await params;
  return (
    <div>
      <AdminPageHeader
        title={`Edit "${block}"`}
        subtitle="This block is stored in the settings.content JSON. Wire custom field editors here per block as needed."
      />
      <div className="p-6 sm:p-8">
        <div className="rounded-lg border border-dashed border-ink/20 bg-paper-warm p-10 text-center">
          <p className="font-display text-lg font-semibold">Block-specific editor TBD</p>
          <p className="mt-1 text-sm text-ink-mute">
            Use the Settings page to edit raw JSON in the meantime.
          </p>
        </div>
      </div>
    </div>
  );
}
