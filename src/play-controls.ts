export function bindPlayActionControls(
  root: ParentNode,
  onAction: (action: string) => void,
): void {
  for (const control of root.querySelectorAll("[data-play-action]")) {
    const action = (control as HTMLElement).dataset.playAction;
    if (!action) {
      continue;
    }
    control.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      onAction(action);
    });
  }
}
