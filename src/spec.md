# Specification

## Summary
**Goal:** Make the audio upload dropzone reliably open the native file picker when tapped/clicked anywhere on the dropzone, especially on mobile Chrome, while preserving existing drag-and-drop behavior.

**Planned changes:**
- Update the UploadSection dropzone so the full dropzone area triggers the underlying `<input type="file">` on click/tap (not just the “Select File” button), with reliable behavior on mobile Chrome.
- Ensure the dropzone respects disabled states (processing/initializing/not logged in): no file picker opens and the disabled styling remains clear.
- Improve hit-area and accessibility: add clear interactive affordance when enabled (e.g., pointer cursor) and support keyboard activation (Enter/Space) to open the file picker.
- Keep desktop drag-and-drop upload behavior unchanged.

**User-visible outcome:** On mobile and desktop, users can tap/click anywhere in the upload box to open the file picker when enabled; the dropzone remains non-interactive when disabled; keyboard users can activate the dropzone with Enter/Space.
