# Logo Setup Guide

## How to Add Your Logo

### Option 1: Using SVG (Recommended)

1. Open `/src/config/logo.tsx`
2. Replace the SVG content in the `Logo` component with your full logo SVG
3. Replace the SVG content in the `LogoIcon` component with your icon-only version

Example:
```tsx
export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg className={className} viewBox="0 0 200 50" fill="currentColor">
      <!-- Your logo SVG content here -->
    </svg>
  );
};
```

### Option 2: Using Image Files

1. Place your logo files in the `/public` directory:
   - `logo-full.png` - Your full logo
   - `logo-icon.png` - Icon-only version
   - `logo-full-dark.png` - Full logo for dark mode (optional)
   - `logo-icon-dark.png` - Icon for dark mode (optional)

2. Update the `LogoImage` paths in `/src/config/logo.tsx` if needed

3. Use the image version in your components:
```tsx
<img src={LogoImage.full} alt="Logo" className="h-10" />
```

### Option 3: Using External URLs

Update the `LogoImage` object with your logo URLs:
```tsx
export const LogoImage = {
  full: 'https://your-domain.com/logo-full.png',
  icon: 'https://your-domain.com/logo-icon.png',
  // ... dark mode versions
};
```

## Logo Text Configuration

Update the `LogoText` object in `/src/config/logo.tsx`:
```tsx
export const LogoText = {
  full: 'Your Company Name',
  short: 'YCN',
};
```

## Where the Logo is Used

- Main header in `/src/components/Layout.tsx`
- Login/Auth pages (if applicable)
- Favicon (update `/index.html` with your icon)

## Recommended Logo Sizes

- Full Logo: 200x50px (or maintain aspect ratio)
- Icon: 40x40px
- Favicon: 32x32px and 16x16px

## Tips

1. Use transparent backgrounds for better theme compatibility
2. Provide both light and dark versions for optimal appearance
3. Keep file sizes small (optimize your images)
4. Test your logo in both light and dark modes