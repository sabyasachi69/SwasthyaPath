export function demoModeEnabled() {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

export const DEMO_NOTICE = "Demo data, not medical advice";
