import fs from 'fs/promises';
import path from 'path';

export default async function getFolderSize(path: string, ignore = /(node_modules|vendor)/gim) {
  const fileSizes = await processPath(path, ignore);
  return Array.from(fileSizes.values()).reduce((total, fileSize) => total + fileSize, 0);
}

async function processPath(itemPath: string, ignore: RegExp, fileSizes?: Map<number, number>) {
  if (!fileSizes) {
    fileSizes = new Map();
  }

  if (ignore?.test(itemPath)) return;

  const stats = await fs.lstat(itemPath);
  fileSizes.set(stats.ino, stats.size);

  if (stats.isDirectory()) {
    const directoryItems = await fs.readdir(itemPath);
    await Promise.all(directoryItems.map(dir => processPath(path.join(itemPath, dir), ignore, fileSizes)));
  }

  return fileSizes;
}
