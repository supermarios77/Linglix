/**
 * Loading state for tutors listing page
 */

export default function TutorsLoading() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] py-20 px-4 md:px-12">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Header skeleton */}
        <div className="space-y-4">
          <div className="h-10 w-64 bg-white dark:bg-[#1a1a1a] rounded-lg animate-pulse" />
          <div className="h-6 w-96 bg-white dark:bg-[#1a1a1a] rounded-lg animate-pulse" />
        </div>
        
        {/* Filters skeleton */}
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-32 bg-white dark:bg-[#1a1a1a] rounded-lg animate-pulse" />
          ))}
        </div>
        
        {/* Tutor cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white dark:bg-[#1a1a1a] rounded-[24px] p-6 space-y-4">
              <div className="w-24 h-24 rounded-full bg-[#f5f5f5] dark:bg-[#262626] animate-pulse mx-auto" />
              <div className="h-6 w-32 bg-[#f5f5f5] dark:bg-[#262626] rounded-lg animate-pulse mx-auto" />
              <div className="h-4 w-24 bg-[#f5f5f5] dark:bg-[#262626] rounded-lg animate-pulse mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
