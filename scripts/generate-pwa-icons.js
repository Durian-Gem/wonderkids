const fs = require('fs');
const path = require('path');

// Simple function to create base64 PNG icons
function createIconDataUrl(size) {
  // This is a simple base64-encoded 1x1 blue pixel PNG
  // In production, you would use proper icon generation tools
  const bluePixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGAWaLJ8AAAAABJRU5ErkJggg==';
  return bluePixel;
}

// Create icon files with placeholder content
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../apps/web/public/icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('🎨 Generating PWA icons...');

sizes.forEach(size => {
  const iconPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  
  // Create a simple SVG as placeholder
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="100%" height="100%" fill="#3b82f6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size/3}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">WK</text>
    </svg>
  `;
  
  // Write placeholder content (in production, convert SVG to PNG)
  fs.writeFileSync(iconPath, `<!-- Placeholder for ${size}x${size} PWA icon -->\n${svgContent}`);
  console.log(`✅ Created icon-${size}x${size}.png`);
});

// Create placeholder screenshots
const screenshotsDir = path.join(__dirname, '../apps/web/public/screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const screenshots = [
  { name: 'dashboard-mobile.png', width: 360, height: 640 },
  { name: 'lesson-mobile.png', width: 360, height: 640 },
  { name: 'dashboard-desktop.png', width: 1280, height: 720 }
];

screenshots.forEach(({ name, width, height }) => {
  const screenshotPath = path.join(screenshotsDir, name);
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="#f8fafc"/>
      <rect x="0" y="0" width="100%" height="60" fill="#3b82f6"/>
      <text x="50%" y="35" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">WonderKids English</text>
      <text x="50%" y="${height/2}" font-family="Arial, sans-serif" font-size="24" fill="#374151" text-anchor="middle" dominant-baseline="middle">Screenshot Placeholder</text>
      <text x="50%" y="${height/2 + 40}" font-family="Arial, sans-serif" font-size="16" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">${name}</text>
    </svg>
  `;
  
  fs.writeFileSync(screenshotPath, `<!-- Placeholder for ${name} -->\n${svgContent}`);
  console.log(`✅ Created ${name}`);
});

console.log('🎉 PWA assets generated successfully!');
console.log('📝 Note: These are placeholder files. In production, use proper icon generation tools.');
