import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const [images, videos] = await Promise.all([
      cloudinary.api.resources({ type: 'upload', resource_type: 'image', max_results: 100 }),
      cloudinary.api.resources({ type: 'upload', resource_type: 'video', max_results: 100 }),
    ]);

    const all = [...images.resources, ...videos.resources];

    // Sort by upload date, newest first ignores type of file
    all.sort((a, b) => {
    const numA = parseInt(a.public_id.replace(/\D/g, ''));
    const numB = parseInt(b.public_id.replace(/\D/g, ''));
    return numB - numA;
    });

    return Response.json(all);
  } catch (error) {
    console.error('Cloudinary error:', error);
    return Response.json([], { status: 200 });
  }
}