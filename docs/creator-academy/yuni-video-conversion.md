# YUNI Motion Video Conversion Guidance

## Current public formats

The public library uses reviewed MP4 sources for `PUSH-in`, `Pull-out`, `PAN`, `TILT`, `tracking`, and `Orbit`. The React preview component supports both MP4 and WebM source entries and always uses `autoplay`, `muted`, `loop`, and `playsInline`.

## MOV sources retained unchanged

- `yuni/motion/PUSH-in.MOV`
- `yuni/motion/Pull-out.MOV`

These originals remain unchanged. Reviewed MP4 derivatives are now available for Push In and Pull Out at `public/videos/creator-academy/yuni/push-in.mp4` and `public/videos/creator-academy/yuni/pull-out.mp4`.

## Recommended derived formats

1. MP4: H.264 video with AAC removed or muted for the public preview.
2. WebM: VP9 video as an optional fallback.
3. Export a poster image or verify the first visible frame before publication.
4. Confirm no personal data, unintended audio, or rights-restricted imagery is present.

Example conversion commands for a reviewed copy only:

```powershell
ffmpeg -i "PUSH-in.MOV" -an -c:v libx264 -pix_fmt yuv420p -movflags +faststart "push-in.mp4"
ffmpeg -i "PUSH-in.MOV" -an -c:v libvpx-vp9 -b:v 0 -crf 32 "push-in.webm"
```
