import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { requireAuth } from '@/lib/guard';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    // 0. Rate limit uploads to prevent DoS and quota exhaustion
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`upload_ip:${clientIp}`, 10, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `High volume of upload requests. Please wait ${rateCheck.retryAfterSeconds} seconds before uploading again.`,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rateCheck.retryAfterSeconds) },
        }
      );
    }

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

    // Passports must strictly be image files only (no PDFs for passports)
    const isPassport = folder.startsWith('mims/passports');
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const documentTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

    const allowedTypes = isPassport ? imageTypes : documentTypes;
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: isPassport
            ? 'Invalid photo format. Student passport photograph must be a JPEG, PNG, or WebP image.'
            : 'Invalid file type. Only JPEG, PNG, WebP images, and PDF documents are permitted.',
        },
        { status: 400 }
      );
    }

    // Validate file size (max 3MB for passport photos, 5MB for academic dossiers)
    const MAX_SIZE = isPassport ? 3 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          error: `File size exceeds maximum permitted limit of ${isPassport ? '3 MB for passport photos' : '5 MB'}.`,
        },
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
