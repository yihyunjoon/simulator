import { ErrorBoundary as SolidErrorBoundary, type ParentProps } from "solid-js";

interface ErrorFallbackProps {
  error: Error;
  reset: () => void;
}

function ErrorFallback(props: ErrorFallbackProps) {
  return (
    <div
      class="min-h-screen flex items-center justify-center p-8"
      style={{
        background: "linear-gradient(135deg, #2c1810 0%, #1a0f0a 50%, #0d0705 100%)",
      }}
      role="alert"
      aria-live="assertive"
    >
      <div class="max-w-lg w-full bg-linear-to-b from-red-900/90 to-red-950/90 border-2 border-red-600/60 p-8 text-center">
        <div class="text-6xl mb-4">⚠️</div>
        <h1 class="text-2xl font-serif text-red-100 mb-4">
          A Calamity Has Befallen
        </h1>
        <p class="text-red-200/80 font-serif mb-6">
          The chronicles have encountered an unexpected error.
        </p>
        <details class="text-left mb-6">
          <summary class="text-red-300/60 text-sm cursor-pointer hover:text-red-300/80">
            Technical Details
          </summary>
          <pre class="mt-2 p-3 bg-red-950/50 text-red-200/70 text-xs overflow-auto max-h-32 rounded">
            {props.error.message}
            {"\n"}
            {props.error.stack}
          </pre>
        </details>
        <div class="flex gap-4 justify-center">
          <button
            onClick={props.reset}
            class="px-6 py-3 bg-linear-to-b from-amber-700 to-amber-900 border border-amber-500 text-amber-100 font-serif tracking-wide hover:from-amber-600 hover:to-amber-800 transition-all"
            aria-label="Try again"
          >
            Try Again
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("chronicles-save");
              window.location.reload();
            }}
            class="px-6 py-3 bg-linear-to-b from-stone-700 to-stone-900 border border-stone-500 text-stone-100 font-serif tracking-wide hover:from-stone-600 hover:to-stone-800 transition-all"
            aria-label="Reset and start fresh"
          >
            Start Fresh
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ErrorBoundary(props: ParentProps) {
  return (
    <SolidErrorBoundary
      fallback={(err, reset) => <ErrorFallback error={err} reset={reset} />}
    >
      {props.children}
    </SolidErrorBoundary>
  );
}
