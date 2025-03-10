import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// NAS 서버 환경설정
const NAS_BASE_URL = process.env.NAS_BASE_URL || 'http://localhost:3000';
const NAS_API_KEY = process.env.NAS_API_KEY || 'your_secret_api_key';

// NAS 서버와 통신하는 클라이언트
class NasClient {
    constructor() {
        this.client = axios.create({
            baseURL: NAS_BASE_URL,
            headers: {
                'x-api-key': NAS_API_KEY,
            },
        });
    }

    // 파일 업로드
    async uploadFile(filePath, customFileName = null) {
        try {
            const formData = new FormData();
            const fileStream = fs.createReadStream(filePath);
            const fileName = customFileName || path.basename(filePath);

            formData.append('file', fileStream, { filename: fileName });

            const response = await this.client.post('/api/upload', formData, {
                headers: {
                    ...formData.getHeaders(),
                },
            });

            return response.data;
        } catch (error) {
            console.error('NAS 파일 업로드 오류:', error.message);
            throw new Error(`NAS 서버에 파일 업로드 실패: ${error.message}`);
        }
    }

    // 파일 다운로드
    async downloadFile(fileName, destinationPath) {
        try {
            const response = await this.client.get(`/api/download/${fileName}`, {
                responseType: 'stream',
            });

            const writer = fs.createWriteStream(destinationPath);

            return new Promise((resolve, reject) => {
                response.data.pipe(writer);
                writer.on('finish', () => resolve(destinationPath));
                writer.on('error', reject);
            });
        } catch (error) {
            console.error('NAS 파일 다운로드 오류:', error.message);
            throw new Error(`NAS 서버에서 파일 다운로드 실패: ${error.message}`);
        }
    }

    // 파일 목록 조회
    async listFiles() {
        try {
            const response = await this.client.get('/api/files');
            return response.data;
        } catch (error) {
            console.error('NAS 파일 목록 조회 오류:', error.message);
            throw new Error(`NAS 서버에서 파일 목록 조회 실패: ${error.message}`);
        }
    }

    // 파일 정보 조회
    async getFileInfo(fileName) {
        try {
            const response = await this.client.get(`/api/files/${fileName}`);
            return response.data;
        } catch (error) {
            console.error('NAS 파일 정보 조회 오류:', error.message);
            throw new Error(`NAS 서버에서 파일 정보 조회 실패: ${error.message}`);
        }
    }

    // 파일 삭제
    async deleteFile(fileName) {
        try {
            const response = await this.client.delete(`/api/files/${fileName}`);
            return response.data;
        } catch (error) {
            console.error('NAS 파일 삭제 오류:', error.message);
            throw new Error(`NAS 서버에서 파일 삭제 실패: ${error.message}`);
        }
    }
}

export default new NasClient();
