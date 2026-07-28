import { Suspense } from "react";
import AdminStudentsPage from "./StudentsClient";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-muted">Loading students…</p>}>
      <AdminStudentsPage />
    </Suspense>
  );
}
