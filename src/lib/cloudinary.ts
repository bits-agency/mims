import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary server-side
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadResult {
  url: string;
  public_id: string;
  format: string;
  bytes: number;
}

/**
 * Upload a base64 or buffer string to Cloudinary
 * @param fileUri base64 string or remote image URL
 * @param folder folder name inside Cloudinary account (e.g. 'mims/students', 'mims/teachers')
 */
export async function uploadToCloudinary(
  fileUri: string,
  folder: string = 'mims/uploads'
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(fileUri, {
    folder,
    resource_type: 'auto',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
    format: result.format,
    bytes: result.bytes,
  };
}

export default cloudinary;
