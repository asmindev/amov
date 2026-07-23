export function selectedButtonClass(isActive: boolean) {
  return isActive
    ? "border border-primary bg-primary/10 text-primary hover:bg-primary/20"
    : "border-border text-gray-300"
}

export function selectedTextButtonClass(isActive: boolean) {
  return isActive
    ? "border border-primary bg-primary/10 text-primary hover:bg-primary/20"
    : "border-border text-muted-foreground hover:text-white"
}

export function subtitleOffsetLabel(offset: number) {
  return offset > 0 ? `+${offset.toFixed(1)}s` : `${offset.toFixed(1)}s`
}
