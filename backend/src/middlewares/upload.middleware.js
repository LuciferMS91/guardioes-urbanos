const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/alertas");
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const nome = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, nome);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Apenas imagens são permitidas"));
        }

        cb(null, true);
    }
});

module.exports = upload;