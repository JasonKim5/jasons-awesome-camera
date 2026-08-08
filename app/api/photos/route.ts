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
      media_metadata: true,
      next_cursor,
    });
    all = [...all, ...result.resources];
    next_cursor = result.next_cursor;
  } while (next_cursor);

  return all;
}

function getDateTaken(item: any): number {
  // Try EXIF DateTimeOriginal for photos
  if (item.image_metadata?.DateTimeOriginal) {
    const raw = item.image_metadata.DateTimeOriginal;
    // EXIF format is "YYYY:MM:DD HH:MM:SS" — fix it to be parseable
    const fixed = raw.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
    const date = new Date(fixed).getTime();
    if (!isNaN(date)) return date;
  }

  // Try video metadata creation time
  if (item.video?.metadata?.creation_time) {
    const date = new Date(item.video.metadata.creation_time).getTime();
    if (!isNaN(date)) return date;
  }

  // Fall back to Cloudinary upload date
  return new Date(item.created_at).getTime();
}

export async function GET() {
  try {
    const [images, videos] = await Promise.all([
      getAllResources('image'),
      getAllResources('video'),
    ]);

    const all = [...images, ...videos];

    // Sort by actual date taken, newest first
    all.sort((a, b) => getDateTaken(b) - getDateTaken(a));

    return Response.json(all);
  } catch (error) {
    console.error('Cloudinary error:', error);
    return Response.json([], { status: 200 });
  }
}