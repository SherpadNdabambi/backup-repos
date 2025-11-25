/**
 * @file exists.ts
 * @description Cross-platform file existence check
 *
 * @exports exists
 */
import { access } from "fs/promises";

/**
 * Cross-platform file existence check
 * @param {string} pathString - The path
 * @returns {Promise<boolean>} True if the file exists
 */
async function exists(pathString: string): Promise<boolean> {
  try {
    await access(pathString);
    return true;
  } catch {
    return false;
  }
}

export { exists };
