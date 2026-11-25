import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import s3 from "../../config/s3";

export const uploadToS3 = async (file: Express.Multer.File) => {
  if (!file) {
    throw new Error("No file provided to uploadToS3");
  }

  const fileExtension = file.originalname.split(".").pop();

  const key = `${randomUUID()}.${fileExtension}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );

  const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return { url, key };
};
