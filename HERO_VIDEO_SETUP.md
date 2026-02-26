# Hero Video Section - Setup Guide

## Overview

The homepage now features a dynamic background video hero section that creates an immersive, calming wellness experience. The implementation includes automatic fallbacks for mobile devices and slow connections.

## Current Implementation

### Files Created/Modified

- **`components/hero-video.tsx`** - Reusable HeroVideo component with video autoplay, looping, and fallback handling
- **`app/page.tsx`** - Updated to use the new HeroVideo component
- **`app/globals.css`** - Added fade-in animation for smooth content appearance
- **`public/videos/hero-wellness-fallback.jpg`** - Fallback image shown while video loads

## Video Asset Requirements

To use this hero section with a custom video, follow these steps:

### 1. Prepare Your Video Files

Create or obtain two video formats:

- **MP4 Format** (for broad compatibility)
  - File: `public/videos/hero-wellness.mp4`
  - Codec: H.264 video, AAC audio
  - Resolution: 1920x1080 (or higher for 4K)
  - Frame rate: 24-30 fps
  - Duration: 10-30 seconds (looping)
  - File size: 2-5 MB recommended for web

- **WebM Format** (for better compression)
  - File: `public/videos/hero-wellness.webm`
  - Codec: VP8/VP9 video, Vorbis/Opus audio
  - Same resolution and frame rate as MP4
  - Typically 30-50% smaller than MP4

### 2. Video Requirements Met by Our Implementation

✅ **Autoplay** - Video starts automatically when page loads
✅ **Muted** - No audio playback (improved UX)
✅ **Looping** - Video continuously loops without interruption
✅ **Mobile Optimized** - Uses `playsInline` for native mobile video behavior
✅ **Responsive** - Maintains aspect ratio on all screen sizes using `object-cover`
✅ **Fallback Image** - Shows static image while video loads or if video unsupported
✅ **Overlay** - Gradient overlay (fade from light to dark) ensures text readability
✅ **Z-index Layering** - Proper stacking: video (0) → overlay (10) → content (20)

### 3. Add Your Videos

**Option A: Using FFmpeg (Recommended)**

Convert your video to both formats:

```bash
# Convert to MP4
ffmpeg -i your-video.mov -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k public/videos/hero-wellness.mp4

# Convert to WebM
ffmpeg -i your-video.mov -c:v libvpx-vp9 -crf 30 -c:a libopus public/videos/hero-wellness.webm
```

**Option B: Online Tools**

- Use CloudConvert (cloudconvert.com) or similar services
- Upload your video and select MP4 and WebM outputs
- Download and place in `public/videos/` directory

**Option C: Using Pre-Made Stock Videos**

Popular sources for spiritual/wellness videos:
- Pexels (pexels.com/videos)
- Pixabay (pixabay.com/videos)
- Unsplash (unsplash.com/videos)
- Coverr (coverr.co)

Search for: "meditation background", "yoga water", "peaceful nature", "sunrise meditation"

### 4. File Placement

Create the directory structure if it doesn't exist:

```
project/
└── public/
    └── videos/
        ├── hero-wellness.mp4
        ├── hero-wellness.webm
        └── hero-wellness-fallback.jpg
```

### 5. Verify Video Setup

After adding your video files:

1. Clear your browser cache
2. Load the homepage
3. You should see the video playing on desktop
4. On mobile, it should show the fallback image or play inline
5. Video should loop continuously without gaps

## Mobile Optimization

### Desktop Behavior
- Full video plays in background
- Gradient overlay applied
- Hero content centered

### Mobile Behavior (screens < 768px)
- Fallback image displays instead of video (lighter on bandwidth)
- If video plays, it plays inline without fullscreen

### Performance Considerations
- Average load time: 2-3 seconds
- Fallback image acts as poster frame
- State-based video loading detection prevents UI flicker

## Customization Options

### Change Video Dimensions

In `components/hero-video.tsx`, modify:

```tsx
<div className="relative h-screen max-h-[600px] md:max-h-[700px] w-full overflow-hidden">
```

Update `max-h-[600px]` and `max-h-[700px]` to your preferred heights.

### Adjust Overlay Opacity

In `components/hero-video.tsx`, modify:

```tsx
<div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/50 z-10" />
```

- `from-black/30` = Top overlay opacity (30%)
- `via-black/40` = Middle overlay opacity (40%)
- `to-black/50` = Bottom overlay opacity (50%)

Increase numbers for darker overlay (better for text readability), decrease for lighter.

### Change Animation Speed

In `app/globals.css`, modify:

```css
@keyframes fadeIn {
  animation: fadeIn 0.8s ease-out forwards;
}
```

Change `0.8s` to desired duration (e.g., `1s` for slower fade).

## Troubleshooting

### Video Not Playing
- Check file format and codec support
- Ensure MIME types are correctly configured
- Try WebM format as primary
- Verify file paths are correct

### Slow Video Load
- Reduce file size using FFmpeg: `-crf 28` (lower quality, smaller file)
- Use WebM format (more efficient compression)
- Consider hosting video on CDN
- Add preload hints to improve perceived performance

### Mobile Issues
- Test on actual devices, not just browser dev tools
- Verify `playsInline` attribute is present
- Check that fallback image displays correctly

### Fallback Image Not Showing
- Verify `hero-wellness-fallback.jpg` exists in `public/videos/`
- Check file path in component
- Try clearing browser cache

## Browser Support

| Browser | MP4 | WebM |
| --- | --- | --- |
| Chrome | ✅ | ✅ |
| Firefox | ✅ | ✅ |
| Safari | ✅ | ❌ |
| Edge | ✅ | ✅ |
| Mobile Safari | ✅ | ❌ |
| Chrome Mobile | ✅ | ✅ |

**Note:** Fallback image displays for unsupported formats.

## Performance Tips

1. **Compress Video Sizes**
   - MP4: Aim for 2-3 MB
   - WebM: Aim for 1-2 MB

2. **Use Progressive Loading**
   - Video starts loading before visible
   - Poster frame shows immediately

3. **Monitor Load Times**
   - Use Chrome DevTools Network tab
   - Aim for < 3 second video load

4. **Optimize Fallback Image**
   - JPEG format, optimized for web
   - Size: ~300-500 KB

## Support

For video format questions, refer to:
- MDN Web Docs: HTML Video Element
- Can I Use: Video Format Support
- FFmpeg Documentation: ffmpeg.org

---

**Last Updated:** February 2026
**Component Version:** 1.0
