import fs from 'fs/promises';
import { join as joinPaths } from 'path';

interface IFolderSizeOptions {
  ignore?: RegExp | undefined;
}

/**
 * Returns an object containing the size of the folder and a list of errors encountered while traversing the folder.
 *
 * If any errors are returned, the returned folder size is likely smaller than the real folder size.
 *
 * @param {string} itemPath         - Path of the folder.
 * @param {object} [options]        - Options.
 * @param {object} [options.ignore] - If a file's path matches this regex object, its size is not counted.
 * @param {object} [options.fs]     - The filesystem that should be used. Uses node fs by default.
 *
 * @returns {Promise<{size: number, errors: Array<Error> | null}>} - An object containing the size of the folder in bytes and a list of encountered errors.
 */
export default async function getFolderSize(
  itemPath: string,
  options: IFolderSizeOptions = { ignore: /(node_modules|vendor)/gim }
) {
  return await core(itemPath, options);
}

async function core(rootItemPath: string, options: IFolderSizeOptions = {}) {
  const fileSizes = new Map();

  await processItem(rootItemPath);

  async function processItem(itemPath: string) {
    if (options.ignore?.test(itemPath)) return;

    const stats = await fs.lstat(itemPath);

    if (typeof stats !== 'object') return;
    fileSizes.set(stats.ino, stats.size);

    if (stats.isDirectory()) {
      const directoryItems = await fs.readdir(itemPath);
      if (typeof directoryItems !== 'object') return;
      await Promise.all(directoryItems.map(directoryItem => processItem(joinPaths(itemPath, directoryItem))));
    }
  }

  return Array.from(fileSizes.values()).reduce((total, fileSize) => total + fileSize, 0);
}
