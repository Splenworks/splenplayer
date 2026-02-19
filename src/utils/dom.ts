export const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return false
  }
  const editableTagNames = ["input", "textarea", "select"]
  return target.isContentEditable || editableTagNames.includes(target.tagName.toLowerCase())
}
