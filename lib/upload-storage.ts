import path from "path";

export function runtimeUploadsDir() {
  return path.resolve(process.env.UPLOAD_STORAGE_DIR ?? path.join(process.cwd(), "storage", "uploads"));
}

export function bundledUploadsDir() {
  return path.join(process.cwd(), "public", "uploads");
}

export function safeUploadPath(root: string, segments: string[]) {
  const targetPath = path.resolve(root, ...segments);
  if (!targetPath.startsWith(path.resolve(root))) return null;
  return targetPath;
}
