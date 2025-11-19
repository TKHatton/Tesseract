# Assets Directory

This directory contains static assets for The Tesseract game.

## Favicon Files

Place the following favicon files in this directory:

- **favicon-16x16.png** - 16x16px favicon for browser tabs
- **favicon-32x32.png** - 32x32px favicon for browser tabs (standard size)
- **apple-touch-icon.png** - 180x180px icon for iOS home screen

## Logo Files

You can place your logo file(s) here:

- **logo.png** or **logo.svg** - Main game logo
  - Recommended: SVG format for scalability
  - Or PNG with transparent background
  - Suggested size: 200-300px wide

## Usage

### Favicon
The favicon is automatically referenced in `index.html` and will appear in browser tabs.

### Logo
To use the logo in your app, import it in your React components:

```jsx
// Example usage in a component:
<img src="/logo.svg" alt="The Tesseract" className="w-48 h-auto" />
```

Or reference it directly:
```jsx
<img src="/logo.png" alt="The Tesseract" className="w-48 h-auto" />
```

## Creating Favicons

If you need to generate favicons from a single image:
1. Create a square image (at least 512x512px)
2. Use a tool like https://realfavicongenerator.net/
3. Or resize manually to 16x16, 32x32, and 180x180 sizes
