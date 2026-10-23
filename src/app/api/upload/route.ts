import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { requireAuth } from '@/lib/guard';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'mims/uploads';

    // Allow prospective students to upload admissions documents, require login for other folders
    const isAdmissionsUpload = folder.startsWith('mims/admissions') || folder.startsWith('mims/passports');
    if (!isAdmissionsUpload) {
      const auth = await requireAuth();
      if (!auth.authorized) return auth.response;
    }

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // Validate mime type (images and pdfs only)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP images, and PDF documents are permitted.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum permitted limit of 5 MB.' },
        { status: 400 }
      );
    }

    // Convert file to base64 data URI
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`;

    const hasCloudinary =
      !!process.env.CLOUDINARY_CLOUD_NAME &&
      !!process.env.CLOUDINARY_API_KEY &&
      !!process.env.CLOUDINARY_API_SECRET;

    if (hasCloudinary) {
      const result = await uploadToCloudinary(base64Data, folder);
      return NextResponse.json({
        success: true,
        url: result.url,
        publicId: result.public_id,
      });
    }

    // Fallback when Cloudinary is not configured yet (returns data URI for local dev)
    return NextResponse.json({
      success: true,
      url: base64Data,
      publicId: 'local_preview_mode',
      note: 'Using local data URI preview mode. Configure Cloudinary in .env.local for production uploads.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
