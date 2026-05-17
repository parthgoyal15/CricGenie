function FeatureSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-4 animate-pulse">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-full bg-zinc-800" />
        <div>
          <div className="h-3.5 w-28 bg-zinc-800 rounded mb-1.5" />
          <div className="h-3 w-20 bg-zinc-800 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-zinc-800 rounded" />
        <div className="h-4 w-4/5 bg-zinc-800 rounded" />
        <div className="h-4 w-3/5 bg-zinc-800 rounded" />
      </div>
    </div>
  );
}

export default function MatchLoading() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* Back link */}
      <div className="h-4 w-20 bg-zinc-800 rounded animate-pulse mb-6" />

      {/* Score card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-4 animate-pulse">
        <div className="flex justify-between mb-5">
          <div className="h-3 w-44 bg-zinc-800 rounded" />
          <div className="h-3 w-12 bg-zinc-800 rounded" />
        </div>
        <div className="space-y-3 mb-5">
          <div className="flex justify-between items-center">
            <div className="h-8 w-40 bg-zinc-800 rounded" />
            <div className="h-10 w-28 bg-zinc-800 rounded" />
          </div>
          <div className="flex justify-between items-center">
            <div className="h-8 w-40 bg-zinc-800 rounded" />
            <div className="h-10 w-28 bg-zinc-800 rounded" />
          </div>
        </div>
        <div className="pt-4 border-t border-zinc-800">
          <div className="h-4 w-24 bg-zinc-800 rounded" />
        </div>
      </div>

      {/* Feature skeletons */}
      <FeatureSkeleton />
      <FeatureSkeleton />
      <FeatureSkeleton />
      <FeatureSkeleton />
    </main>
  );
}
