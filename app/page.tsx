'use client';
import { useEffect, useState } from 'react';

interface MediaItem {
  public_id: string;
  secure_url: string;
  resource_type: string;
}

export default function Home() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [uploading, setUploading] = useState(false);

  const loadPhotos = () => {
    fetch('/api/photos')
      .then(res => res.json())
      .then(data => setMedia(data));
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    setUploading(false);
    loadPhotos();
  };

  return (
    <main style={{ background: '#111', minHeight: '100vh', padding: '2rem' }}>
      <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '1rem', fontSize: '3rem' }}>
        Jason's Awesome Camera
      </h1>

      {/* Upload Button */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <label style={{
          background: '#444',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1rem'
        }}>
          {uploading ? 'Uploading...' : '📤 Upload Photo/Video'}
          <input type="file" accept="image/*,video/*" onChange={handleUpload} style={{ display: 'none' }} />
        </label>
      </div>

      {/* Gallery Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '1rem'
      }}>
        {media.map((item) => (
          <div key={item.public_id} onClick={() => setSelected(item)}
            style={{ borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }}>
            {item.resource_type === 'video' ? (
              <video style={{ width: '100%', display: 'block' }}>
                <source src={item.secure_url} />
              </video>
            ) : (
              <img src={item.secure_url} alt={item.public_id} style={{ width: '100%', display: 'block' }} />
            )}
          </div>
        ))}
      </div>

      {media.length === 0 && (
        <p style={{ color: 'gray', textAlign: 'center', marginTop: '4rem' }}>
          No photos yet — upload some!
        </p>
      )}

      {/* Lightbox */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.9)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000, cursor: 'pointer'
        }}>
          {selected.resource_type === 'video' ? (
            <video controls style={{ maxWidth: '90%', maxHeight: '90vh' }}>
              <source src={selected.secure_url} />
            </video>
          ) : (
            <img src={selected.secure_url} alt={selected.public_id}
              style={{ maxWidth: '90%', maxHeight: '90vh', objectFit: 'contain' }} />
          )}
          <span style={{ position: 'absolute', top: '1rem', right: '1.5rem', color: 'white', fontSize: '2rem', cursor: 'pointer' }}>✕</span>
        </div>
      )}
    </main>
  );
}