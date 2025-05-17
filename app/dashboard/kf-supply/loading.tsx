import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Skeleton className="h-10 w-[400px] mb-6" />
      <div className="grid gap-6">
        <Skeleton className="h-[150px] w-full rounded-lg" />

        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-[120px] w-full rounded-lg" />
          <Skeleton className="h-[120px] w-full rounded-lg" />
          <Skeleton className="h-[120px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
