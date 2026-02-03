# Specification

## Summary
**Goal:** Replace the current placeholder video/thumbnail with a valid, good-looking multi-character cartoon placeholder MP4 and ensure playback + download reliably produce real playable .mp4 files.

**Planned changes:**
- Add a new valid horizontal placeholder MP4 (multi-character cartoon forest scene with visible motion) under `frontend/public/assets/placeholders/` and switch placeholder creation/playback to use it so it passes validation and plays reliably in the modal player.
- Align gallery and modal playback to use the same MP4 bytes source: backend-served bytes when available, otherwise the new placeholder MP4.
- Fix/adjust the Download action so it downloads a real playable `.mp4` (non-zero/near-zero size) that opens in standard phone/desktop gallery players.
- Add a new cartoon-appropriate default gallery thumbnail image (matching the multi-character forest style) as a static asset under `frontend/public/assets/generated/` and use it wherever the UI falls back to a default thumbnail.
- Ensure any newly added/updated user-facing text in the affected playback/download/placeholder flows is in English.

**User-visible outcome:** Placeholder videos and videos in the gallery/modal play consistently without immediate failure, and the Download button produces a real `.mp4` file that plays in external gallery/video players; items without thumbnails show a matching cartoon default thumbnail.
