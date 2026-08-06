import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function getAllResources(resource_type: string) {
  let all: any[] = [];
  let next_cursor: string | undefined = undefined;

  do {
    const result: any = await cloudinary.api.resources({
      type: 'upload',
      resource_type,
      max_results: 100,
      image_metadata: true,
      next_cursor,
    });
    all = [...all, ...result.resources];
    next_cursor = result.next_cursor;
  } while (next_cursor);

  return all;
}

export async function GET() {
  try {
    const [images, videos] = await Promise.all([
      getAllResources('image'),
      getAllResources('video'),
    ]);

    const all = [...images, ...videos];

    all.sort((a, b) => {
      // Use EXIF date taken, fall back to upload date if not available
      const dateA = a.image_metadata?.DateTimeOriginal 
        ? new Date(a.image_metadata.DateTimeOriginal.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3')).getTime()
        : new Date(a.created_at).getTime();

      const dateB = b.image_metadata?.DateTimeOriginal 
        ? new Date(b.image_metadata.DateTimeOriginal.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3')).getTime()
        : new Date(b.created_at).getTime();

      return dateB - dateA;
    });

    return Response.json(all);
  } catch (error) {
    console.error('Cloudinary error:', error);
    return Response.json([], { status: 200 });
  }
}