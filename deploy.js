  // deploy.js
  import dotenv from 'dotenv';
  import process from 'process';
  dotenv.config(); //Đọc file .env
  import { execSync } from 'child_process';
  import ftp from 'basic-ftp';
  import path from 'path';
  import { fileURLToPath } from 'url';
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  async function deploy() {
    console.log('🚀 Bắt đầu build project...');
    execSync('npm run build', { stdio: 'inherit' });

    console.log('📡 Đang kết nối FTP và upload file...');

    const client = new ftp.Client();
    client.ftp.verbose = true; // In log upload

    try {
      await client.access({
        host: process.env.FTP_HOST,
        user: process.env.FTP_USER,
        password: process.env.FTP_PASS,
        secure: false, // Nếu host hỗ trợ FTPS thì đặt true
      });

      // Upload tất cả file trong thư mục dist lên public_html
      await client.uploadFromDir('dist', '/domains/stu.mnhwua.id.vn/public_html');

      console.log('✅ Upload hoàn tất!');
    } catch (err) {
      console.error('❌ Lỗi upload:', err);
    } finally {
      client.close();
    }
  }

  deploy();
