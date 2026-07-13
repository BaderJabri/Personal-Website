"use client";

import dynamic from "next/dynamic";

// Dev-only annotation overlay (package: "agentation"). Dynamically imported
// and dead-code-eliminated from production bundles by the NODE_ENV check below
// (verify with `grep -ri agentation out/` after a build).
const FeedbackOverlay =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("agentation").then((m) => m.Agentation), {
        ssr: false,
      })
    : null;

export function DevFeedbackTool() {
  if (!FeedbackOverlay) return null;
  return <FeedbackOverlay />;
}
