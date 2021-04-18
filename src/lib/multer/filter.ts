import { BadRequestException } from '@nestjs/common';

export const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else
    cb(
      new BadRequestException(
        `Parametro ${file.fieldname} (${file.originalname}) no es una imagen`,
      ),
      false,
    );
};
