import { Suspense } from "react";
import AdminApplicationsPage from "./ApplicationsClient";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-muted">Loading applications…</p>}>
      <AdminApplicationsPage />
    </Suspense>
  );
}
