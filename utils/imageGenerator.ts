
import { Template } from '../types';

export const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
  });
};

export const generateTemplateImage = async (
  template: Template,
  userData: { photoUrl?: string; name?: string }
): Promise<Blob> => {
  // 1. Load Base Image
  const baseImage = await loadImage(template.imageUrl);

  // 2. Setup Canvas
  const canvas = document.createElement('canvas');
  canvas.width = baseImage.naturalWidth;
  canvas.height = baseImage.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context failed');

  // 3. Draw Base
  ctx.drawImage(baseImage, 0, 0);

  // 4. Draw User Photo
  if (userData.photoUrl) {
    const userImage = await loadImage(userData.photoUrl);
    const { x, y, width, height, shape } = template.placeholder;

    // Convert % to pixels
    const zoneX = (x / 100) * canvas.width;
    const zoneY = (y / 100) * canvas.height;
    const zoneW = (width / 100) * canvas.width;
    const zoneH = (height / 100) * canvas.height;

    ctx.save();
    ctx.beginPath();
    if (shape === 'circle') {
      ctx.ellipse(
        zoneX + zoneW / 2,
        zoneY + zoneH / 2,
        zoneW / 2,
        zoneH / 2,
        0, 0, 2 * Math.PI
      );
    } else {
      ctx.rect(zoneX, zoneY, zoneW, zoneH);
    }
    ctx.clip();

    // Draw image "cover" style
    const imgRatio = userImage.naturalWidth / userImage.naturalHeight;
    const zoneRatio = zoneW / zoneH;

    let renderW, renderH, renderX, renderY;

    if (imgRatio > zoneRatio) {
      // Image is wider than zone
      renderH = zoneH;
      renderW = zoneH * imgRatio;
      renderX = zoneX - (renderW - zoneW) / 2;
      renderY = zoneY;
    } else {
      // Image is taller than zone
      renderW = zoneW;
      renderH = zoneW / imgRatio;
      renderX = zoneX;
      renderY = zoneY - (renderH - zoneH) / 2;
    }

    ctx.drawImage(userImage, renderX, renderY, renderW, renderH);
    ctx.restore();
  }

  // 5. Draw Name
  if (template.nameField && userData.name) {
    const { x, y, width, height, color, fontSize, align, fontFamily } = template.nameField;

    const zoneX = (x / 100) * canvas.width;
    const zoneY = (y / 100) * canvas.height;
    const zoneW = (width / 100) * canvas.width;
    const zoneH = (height / 100) * canvas.height;

    // Calculate font size relative to canvas width
    const fSize = (fontSize || 24) * (canvas.width / 800);

    ctx.font = `bold ${fSize}px ${fontFamily || 'Arial'}`;
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';

    let textX = zoneX;
    const textY = zoneY + zoneH / 2;

    if (align === 'center') {
      ctx.textAlign = 'center';
      textX = zoneX + zoneW / 2;
    } else if (align === 'right') {
      ctx.textAlign = 'right';
      textX = zoneX + zoneW;
    } else {
      ctx.textAlign = 'left';
    }

    ctx.fillText(userData.name, textX, textY);
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
        if(blob) resolve(blob);
        else reject(new Error("Canvas blob failed"));
    }, 'image/png');
  });
};
