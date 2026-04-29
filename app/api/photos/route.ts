import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const [images, videos] = await Promise.all([
      cloudinary.api.resources({ type: 'upload', resource_type: 'image', max_results: 100, image_metadata: true }),
      cloudinary.api.resources({ type: 'upload', resource_type: 'video', max_results: 100 }),
    ]);

    const all = [...images.resources, ...videos.resources];

    all.sort((a, b) => {
      // Try to get EXIF date taken, fall back to upload date
      const dateA = a.image_metadata?.DateTimeOriginal || a.created_at;
      const dateB = b.image_metadata?.DateTimeOriginal || b.created_at;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    return Response.json(all);
  } catch (error) {
    console.error('Cloudinary error:', error);
    return Response.json([], { status: 200 });
  }
}