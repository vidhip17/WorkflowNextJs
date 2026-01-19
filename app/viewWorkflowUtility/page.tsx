// app/viewWorkflowUtility/page.tsx
import { Suspense } from "react";
import ViewWorkflowPage from "./ViewWorkflowPage"; // your component

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ViewWorkflowPage />
    </Suspense>
  );
}
