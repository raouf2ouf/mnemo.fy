function keydownGlobalListener(e: KeyboardEvent) {}

export function attachGlobalListeners() {
  window.addEventListener("keydown", keydownGlobalListener);
  return () => {
    window.removeEventListener("keydown", keydownGlobalListener);
  };
}
