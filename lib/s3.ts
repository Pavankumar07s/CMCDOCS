import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function uploadToS3(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: fileName,
    Body: file,
    ContentType: contentType,
    CacheControl: 'max-age=31536000',
  })

  await s3Client.send(command)
  
  // Generate a signed URL that's valid for 1 hour
  const getCommand = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: fileName,
  })
  
  return await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 })
}

export async function getSignedMediaUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
  })
  
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 })
}