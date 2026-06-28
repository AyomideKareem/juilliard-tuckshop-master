import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "..", "..", "uploads", "products");

if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, uploadsDir),
	filename: (_req, file, cb) => {
		const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
		cb(null, `${unique}${path.extname(file.originalname)}`);
	},
});

const fileFilter = (_req, file, cb) => {
	const allowed = /jpeg|jpg|png|gif|webp/;
	const ext = allowed.test(path.extname(file.originalname).toLowerCase());
	const mime = allowed.test(file.mimetype);
	if (ext && mime) {
		cb(null, true);
	} else {
		cb(new Error("Only image files (jpeg, png, gif, webp) are allowed"));
	}
};

export const uploadProductImage = multer({
	storage,
	fileFilter,
	limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadsDirPath = uploadsDir;
