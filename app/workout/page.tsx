import { Suspense } from "react";
import { WorkoutPageView } from "@/components/workout-page";

export default function WorkoutPage() {
  return (
    <Suspense fallback={null}>
      <WorkoutPageView />
    </Suspense>
  );
}
