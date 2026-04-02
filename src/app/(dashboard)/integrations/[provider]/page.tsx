import { notFound } from "next/navigation";

import { IntegrationPageContent } from "@/components/integrations/integration-page-content";
import { disconnectIntegrationAction } from "@/lib/actions/integrations";
import { requireViewer } from "@/lib/auth";
import { getActiveIntegrationByProvider } from "@/lib/queries/integrations";

export default async function IntegrationPage({
  params,
}: {
  params: Promise<{ provider: string }>;
}) {
  await requireViewer();
  const { provider } = await params;
  const connection = await getActiveIntegrationByProvider(provider);

  if (!connection) {
    notFound();
  }

  return (
    <IntegrationPageContent
      connection={connection}
      disconnectAction={disconnectIntegrationAction}
    />
  );
}
