import { Suspense } from "react";
import WorkflowActionPage from "./WorkflowActionPage"; // your component`

export default function page() {
    return (
    <Suspense fallback={<p>Loading...</p>}>
          <WorkflowActionPage />
        </Suspense>
    )
}
