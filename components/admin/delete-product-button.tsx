"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { deleteProduct } from "@/app/admin/products/actions";

export function DeleteProductButton({
  productId,
  productTitle,
}: {
  productId: string;
  productTitle: string;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function onDelete() {
    const ok = window.confirm(
      `Delete "${productTitle}" permanently?\n\nThis cannot be undone.`,
    );
    if (!ok) return;
    setPending(true);
    try {
      await deleteProduct(productId);
      toast.success("Product deleted", { description: productTitle });
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      toast.error("Delete failed", { description: (err as Error).message });
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onDelete}
      disabled={pending}
      className="text-destructive hover:bg-destructive/10"
    >
      <Icon icon="trash-can" />
      {pending ? "Deleting…" : "Delete"}
    </Button>
  );
}
