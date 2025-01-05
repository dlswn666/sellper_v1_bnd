import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_BASE_DIR = 'images';
const IMAGE_TYPES = {
    THUMBNAIL: 'thumbnail',
    PRODUCT: 'product',
    PROFILE: 'profile',
    BANNER: 'banner',
    BRAND: 'brand',
    CATEGORY: 'category',
    ETC: 'etc',
};

// 이미지 타입별 경로 생성 함수
const createImagePath = (imageType) => {
    const imagePath = path.join(process.cwd(), UPLOAD_BASE_DIR, imageType);
    if (!fs.existsSync(imagePath)) {
        fs.mkdirSync(imagePath, { recursive: true });
    }
    return imagePath;
};

// 기본 파일 이름 생성 함수
const defaultFileNamer = (file) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    return uniqueSuffix + path.extname(file.originalname);
};

// multer 설정 생성 함수
export const createUploader = (options = {}) => {
    const imageType = options.imageType || IMAGE_TYPES.THUMBNAIL;
    const uploadPath = createImagePath(imageType);

    console.log(options);

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const fileName = options.fileNamer ? options.fileNamer(file, req) : defaultFileNamer(file);
            cb(null, fileName);
        },
    });

    const fileFilter = (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('지원하지 않는 파일 형식입니다.'), false);
        }
    };

    return multer({
        storage: storage,
        fileFilter: fileFilter,
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB 제한
        },
    });
};

// 파일 업로드 핸들러
export const handleFileUpload = (uploader, imageType = IMAGE_TYPES.THUMBNAIL) => {
    return async (req, res) => {
        try {
            await new Promise((resolve, reject) => {
                // 'images'로 필드명 변경 (클라이언트와 일치)
                uploader.array('images')(req, res, (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });

            if (!req.files || req.files.length === 0) {
                throw new Error('파일이 선택되지 않았습니다.');
            }

            // 여러 파일 처리
            const uploadedFiles = req.files.map((file) => ({
                fileName: file.filename,
                originalName: file.originalname,
                filePath: `/${UPLOAD_BASE_DIR}/${imageType}/${file.filename}`,
                fileSize: file.size,
                mimeType: file.mimetype,
            }));

            return uploadedFiles;
        } catch (error) {
            throw error;
        }
    };
};

// 이미지 타입 상수 export
export { IMAGE_TYPES };
