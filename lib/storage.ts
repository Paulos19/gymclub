import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_ROOT = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(process.cwd(), "uploads");

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function ensureUploadDir(folder: string = ""): Promise<string> {
  const targetDir = path.join(UPLOAD_ROOT, folder);
  try {
    await fs.mkdir(targetDir, { recursive: true });
  } catch {
    // Diretório já existente ou criado concorrentemente
  }
  return targetDir;
}

export async function saveUploadedFile(
  file: File,
  folder: "profiles" | "progress" = "profiles"
): Promise<{ url: string; filename: string; size: number }> {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("Formato de arquivo não suportado. Use JPG, PNG, WEBP ou GIF.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("O arquivo ultrapassa o limite de 10MB.");
  }

  const targetDir = await ensureUploadDir(folder);

  const ext = path.extname(file.name) || `.${file.type.split("/")[1] || "jpg"}`;
  const randomHash = crypto.randomBytes(16).toString("hex");
  const filename = `${Date.now()}-${randomHash}${ext}`;
  const filepath = path.join(targetDir, filename);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await fs.writeFile(filepath, buffer);

  // Retorna a URL relativa servida pela API interna
  const publicUrl = `/api/uploads/${folder}/${filename}`;

  return {
    url: publicUrl,
    filename,
    size: file.size,
  };
}

export async function deleteUploadedFile(publicUrl: string): Promise<boolean> {
  try {
    // Normaliza publicUrl (ex: /api/uploads/profiles/123.jpg -> profiles/123.jpg)
    const relative = publicUrl.replace(/^\/api\/uploads\//, "");
    const safePath = path.normalize(relative).replace(/^(\.\.(\/|\\|$))+/, "");
    const fullPath = path.join(UPLOAD_ROOT, safePath);

    await fs.unlink(fullPath);
    return true;
  } catch {
    return false;
  }
}

export function getUploadRoot(): string {
  return UPLOAD_ROOT;
}
