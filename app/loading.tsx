export default function HomeLoading() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8 animate-pulse">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-9 w-44 bg-zinc-800 rounded-lg" />
          <div className="h-6 w-24 bg-zinc-800 rounded-full" />
        </div>
        <div className="h-4 w-72 bg-zinc-800 rounded" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex justify-between mb-4">
              <div className="h-3 w-36 bg-zinc-800 rounded" />
              <div className="h-3 w-12 bg-zinc-800 rounded" />
            </div>
            <div className="space-y-2.5 mb-4">
              <div className="flex justify-between items-center">
                <div className="h-7 w-32 bg-zinc-800 rounded" />
                <div className="h-8 w-20 bg-zinc-800 rounded" />
              </div>
              <div className="flex justify-between items-center">
                <div className="h-7 w-32 bg-zinc-800 rounded" />
                <div className="h-8 w-20 bg-zinc-800 rounded" />
              </div>
            </div>
            <div className="pt-3 border-t border-zinc-800 flex justify-between">
              <div className="h-3 w-16 bg-zinc-800 rounded" />
              <div className="h-3 w-24 bg-zinc-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
