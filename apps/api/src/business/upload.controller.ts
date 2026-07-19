import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { BusinessService } from './business.service';

const UPLOAD_DIR = join(process.cwd(), 'uploads');
const ALLOWED = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg']);

/**
 * Biznes logosini yuklash (REST, chunki GraphQL'da fayl noqulay).
 * Global AuthGuard token talab qiladi; egalik service'da tekshiriladi.
 *   POST /upload/logo  (multipart, field: "file")  → { logoUrl }
 */
@Controller('upload')
export class UploadController {
  constructor(private readonly businessService: BusinessService) {}

  @Post('logo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `logo-${Date.now()}${ext}`);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        cb(null, ALLOWED.has(ext));
      },
    }),
  )
  async uploadLogo(
    @Req() req: { user?: { userId: string } },
    @UploadedFile() file?: { filename: string },
  ) {
    if (!req.user?.userId) {
      throw new BadRequestException('Autentifikatsiya talab qilinadi.');
    }
    if (!file) {
      throw new BadRequestException(
        'Rasm fayli kerak (png/jpg/webp/svg, maks 2MB).',
      );
    }
    const logoUrl = `/uploads/${file.filename}`;
    const business = await this.businessService.setLogo(
      req.user.userId,
      logoUrl,
    );
    return { logoUrl: business.logoUrl };
  }
}
