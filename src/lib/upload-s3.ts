// src/lib/upload-s3.ts

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// ① AWS S3 클라이언트 초기화
const s3 = new S3Client({
  region: process.env.NEXT_PUBLIC_S3_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY!,
    secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_KEY!,
  }
});

// ② Blob → S3 업로드 후 public URL 리턴
export async function uploadToS3(blob: Blob, key: string): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  await s3.send(new PutObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET,
    Key: key,
    Body: new Uint8Array(arrayBuffer),
    ContentType: 'image/png',
    ACL: 'public-read',
  }));
  return `https://${process.env.NEXT_PUBLIC_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_S3_REGION}.amazonaws.com/${key}`;
}