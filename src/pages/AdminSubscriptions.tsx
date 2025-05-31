import { AdminSubscriptionOverview } from "@/components/admin/AdminSubscriptionOverview";
import { AdminSubscriptionDetails } from "@/components/admin/AdminSubscriptionDetails";
import { PageWrapper } from "@/components/layout/PageWrapper";

export default function AdminSubscriptions() {
  return (
    <PageWrapper>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        <div className="grid grid-cols-1 gap-8">
          <AdminSubscriptionOverview />
          <AdminSubscriptionDetails />
        </div>
      </div>
    </PageWrapper>
  );
}
