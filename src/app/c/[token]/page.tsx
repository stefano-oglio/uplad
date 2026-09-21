import { redirect, notFound } from "next/navigation";
import {
  consumeMagicLink,
  setClientSession,
  getClientSession,
} from "@/lib/magic-link";

type Params = Promise<{ token: string }>;

export default async function MagicLinkEntryPage({
  params,
}: {
  params: Params;
}) {
  const { token } = await params;

  // Already logged in as same flow — go to mailbox
  const existing = await getClientSession();
  const client = await consumeMagicLink(token);
  if (!client) {
    // If session already valid, allow mailbox
    if (existing) redirect("/c/buzon");
    notFound();
  }

  await setClientSession({
    clientId: client.id,
    organizationId: client.organizationId,
  });

  redirect("/c/buzon");
}
