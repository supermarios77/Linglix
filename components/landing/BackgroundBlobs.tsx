/**
 * Background Blobs Component
 * 
 * Ambient background gradient blobs for visual depth
 * Production-ready with proper accessibility
 */
export function BackgroundBlobs() {
  return (
    <>
      <div
        className="blob blob-1 fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-60 blur-[80px] -z-10 bg-[radial-gradient(circle,rgb(224,231,255)_0%,rgba(255,255,255,0)_70%)] dark:bg-[radial-gradient(circle,rgba(121,40,202,0.3)_0%,rgba(0,0,0,0)_70%)]"
        aria-hidden="true"
      />
      <div
        className="blob blob-2 fixed bottom-0 right-[-10%] w-[600px] h-[600px] rounded-full opacity-60 blur-[80px] -z-10 bg-[radial-gradient(circle,rgb(255,228,230)_0%,rgba(255,255,255,0)_70%)] dark:bg-[radial-gradient(circle,rgba(255,230,0,0.2)_0%,rgba(0,0,0,0)_70%)]"
        aria-hidden="true"
      />
    </>
  );
}

