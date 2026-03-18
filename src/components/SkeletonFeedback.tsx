export const SkeletonFeedback = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-5 rounded-2xl border border-border bg-secondary/50">
          <div className="h-3 w-12 bg-border rounded mb-3" />
          <div className="h-7 w-16 bg-border rounded" />
        </div>
      ))}
    </div>
    <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
      <div className="h-5 w-40 bg-border rounded" />
      {[1, 2, 3].map((i) => (
        <div key={i}>
          <div className="h-3 w-20 bg-border rounded mb-2" />
          <div className="h-2 w-full bg-border rounded-full" />
        </div>
      ))}
    </div>
    <div className="p-6 rounded-2xl border border-border bg-card">
      <div className="h-5 w-32 bg-border rounded mb-3" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-border rounded" />
        <div className="h-3 w-4/5 bg-border rounded" />
        <div className="h-3 w-3/5 bg-border rounded" />
      </div>
    </div>
  </div>
);
