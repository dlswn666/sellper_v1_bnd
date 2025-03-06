import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { v4 as uuid4 } from 'uuid';
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
            fileSize: 20 * 1024 * 1024, // 20MB 제한
        },
    });
};

// 이미지 처리 유틸리티 함수들
const imageProcessing = {
    // 이미지 리사이즈 함수
    async resize(buffer, width, height, options = {}) {
        const defaultOptions = {
            fit: 'cover',
            position: 'center',
            background: { r: 255, g: 255, b: 255, alpha: 1 },
        };

        return sharp(buffer)
            .resize(width, height, { ...defaultOptions, ...options })
            .toBuffer();
    },

    // 이미지 확대 함수 수정 (밝기, 색상 유지하면서 확대)
    async upscale(buffer, scale = 1.2) {
        const image = sharp(buffer);
        const metadata = await image.metadata();

        // 원본 크기에서 scale 비율만큼 확대
        const newWidth = Math.round(metadata.width * scale);
        const newHeight = Math.round(metadata.height * scale);

        // 최적화된 고정 옵션 설정
        const optimizedOptions = {
            quality: 90, // 90% 품질로 설정
            progressive: true, // 프로그레시브 JPEG으로 설정
        };

        return image
            .resize(newWidth, newHeight, {
                kernel: 'lanczos3', // 고품질 확대를 위한 알고리즘
                fit: 'fill',
                withoutEnlargement: false, // 확대 허용
            })
            .jpeg({
                quality: optimizedOptions.quality,
                progressive: optimizedOptions.progressive,
                force: false,
            })
            .toBuffer();
    },

    // 이미지 회전 함수
    async rotate(buffer, angle, direction = 'auto') {
        const background = { r: 255, g: 255, b: 255, alpha: 1 }; // 흰색 배경 설정

        if (direction === 'auto') {
            return sharp(buffer)
                .rotate() // EXIF 기반 자동 회전
                .flatten({ background }) // 투명 영역을 흰색으로 채움
                .toBuffer();
        }

        // 수동 회전 각도 설정
        return sharp(buffer)
            .rotate(angle, { background }) // 회전 시 흰색 배경 적용
            .flatten({ background }) // 투명 영역을 흰색으로 채움
            .toBuffer();
    },
};

// 이미지 처리 옵션 범위 정의
const PROCESSING_RANGES = {
    rotate: [
        { angle: 1, direction: 'manual' },
        { angle: 2, direction: 'manual' },
        { angle: 3, direction: 'manual' },
        { angle: 4, direction: 'manual' },
        { angle: 5, direction: 'manual' },
        { angle: 6, direction: 'manual' },
        { angle: 7, direction: 'manual' },
        { angle: 8, direction: 'manual' },
        { angle: 9, direction: 'manual' },
        { angle: 10, direction: 'manual' },
        { angle: 1, direction: 'auto' },
        { angle: 2, direction: 'auto' },
        { angle: 3, direction: 'auto' },
        { angle: 4, direction: 'auto' },
        { angle: 5, direction: 'auto' },
        { angle: 6, direction: 'auto' },
        { angle: 7, direction: 'auto' },
        { angle: 8, direction: 'auto' },
        { angle: 9, direction: 'auto' },
        { angle: 10, direction: 'auto' },
    ],
    resize: [{ width: 1000, height: 1000 }],
    upscale: [
        { scale: 1.01 },
        { scale: 1.02 },
        { scale: 1.03 },
        { scale: 1.04 },
        { scale: 1.05 },
        { scale: 1.06 },
        { scale: 1.07 },
        { scale: 1.08 },
        { scale: 1.09 },
        { scale: 1.1 },
        { scale: 1.11 },
        { scale: 1.12 },
        { scale: 1.13 },
        { scale: 1.14 },
        { scale: 1.15 },
        { scale: 1.16 },
        { scale: 1.17 },
        { scale: 1.18 },
        { scale: 1.19 },
        { scale: 1.2 },
    ],
};

// 랜덤 처리 옵션 생성 함수
const getRandomProcessingOptions = () => {
    const randomOption = (array) => array[Math.floor(Math.random() * array.length)];

    return {
        rotate: randomOption(PROCESSING_RANGES.rotate),
        resize: randomOption(PROCESSING_RANGES.resize),
        upscale: randomOption(PROCESSING_RANGES.upscale),
    };
};

// 파일 업로드 핸들러 수정
export const handleFileUpload = (uploader, imageType = IMAGE_TYPES.THUMBNAIL) => {
    return async (req, res) => {
        const tempFiles = []; // 삭제할 임시 파일들의 경로를 저장

        try {
            await new Promise((resolve, reject) => {
                uploader.array('images')(req, res, (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });

            if (!req.files || req.files.length === 0) {
                throw new Error('파일이 선택되지 않았습니다.');
            }

            // 임시 파일 경로 저장
            tempFiles.push(...req.files.map((file) => file.path));

            const uploadedFiles = await Promise.all(
                req.files.map(async (file) => {
                    const processingOptions = getRandomProcessingOptions();
                    let buffer = fs.readFileSync(file.path);

                    // 이미지 처리 순서 적용
                    buffer = await imageProcessing.rotate(
                        buffer,
                        processingOptions.rotate.angle,
                        processingOptions.rotate.direction
                    );

                    buffer = await imageProcessing.resize(
                        buffer,
                        processingOptions.resize.width,
                        processingOptions.resize.height
                    );

                    buffer = await imageProcessing.upscale(buffer, processingOptions.upscale.scale);

                    // 처리된 이미지 저장 (원본 파일명 기반)
                    const processedFileName = `processed-${file.filename}`;
                    const processedFilePath = path.join(process.cwd(), UPLOAD_BASE_DIR, imageType, processedFileName);

                    await sharp(buffer).toFile(processedFilePath);

                    const uuid = uuid4();

                    return {
                        processed: {
                            imgId: uuid,
                            fileName: processedFileName,
                            originalName: file.originalname,
                            filePath: `/${UPLOAD_BASE_DIR}/${imageType}/${processedFileName}`,
                            fileSize: buffer.length,
                            mimeType: file.mimetype,
                            processingOptions,
                        },
                    };
                })
            );

            // 임시 파일들 삭제
            await Promise.all(
                tempFiles.map(async (filePath) => {
                    try {
                        await fs.promises.unlink(filePath);
                    } catch (err) {
                        console.error(`임시 파일 삭제 실패: ${filePath}`, err);
                    }
                })
            );

            return uploadedFiles;
        } catch (error) {
            // 에러 발생 시에도 임시 파일 삭제 시도
            await Promise.all(
                tempFiles.map(async (filePath) => {
                    try {
                        await fs.promises.unlink(filePath);
                    } catch (err) {
                        console.error(`임시 파일 삭제 실패: ${filePath}`, err);
                    }
                })
            );
            throw error;
        }
    };
};

// 이미지 타입 상수 export
export { IMAGE_TYPES, imageProcessing };
