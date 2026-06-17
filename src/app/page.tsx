import { Suspense } from "react";
import { PlatformShowcasePage } from "@/features/showcase/PlatformShowcasePage";
import { Skeleton } from "@/shared/ui/Skeleton";

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-[42rem] px-4 py-8">
          <Skeleton className="aspect-[21/9] w-full rounded-2xl" />
        </main>
      }
    >
      <PlatformShowcasePage />
    </Suspense>
  );
}
