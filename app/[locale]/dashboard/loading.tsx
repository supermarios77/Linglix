/**
 * Loading state for dashboard page
 */

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] py-20 px-4 md:px-12">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Header skeleton */}
        <div className="h-10 w-64 bg-white dark:bg-[#1a1a1a] rounded-lg animate-pulse" />
        
        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-[#1a1a1a] rounded-[24px] p-6 h-32 animate-pulse" />
          ))}
        </div>
        
        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[24px] p-6 h-96 animate-pulse" />
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[24px] p-6 h-96 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
