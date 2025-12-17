/**
 * Loading state for video call page
 * 
 * Shows a loading UI while the video call session is being initialized
 */

export default function VideoCallLoading() {
  return (
    <div className="relative min-h-screen bg-[#fafafa] dark:bg-[#050505] text-[#111] dark:text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-lg font-medium text-[#111] dark:text-white">
          Joining video call...
        </p>
        <p className="text-sm text-[#666] dark:text-[#999]">
          Please wait while we connect you
        </p>
      </div>
    </div>
  );
}
