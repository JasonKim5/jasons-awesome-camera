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

  useEffect(() => {
    fetch('/api/photos')
      .then(res => res.json())
      .then(data => setMedia(data));
  }, []);

  const handleDownload = async (url: string, filename: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <main style={{ background: '#111', minHeight: '100vh', padding: '2rem' }}>
      <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '2rem', fontSize: '3rem' }}>
        Jason's Awesome Camera
      </h1>

      {/* Gallery Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '1rem'
      }}>
        {media.map((item) => (
          <div key={item.public_id} style={{ borderRadius: '8px', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}>
            {item.resource_type === 'video' ? (
              <video onClick={() => setSelected(item)} style={{ width: '100%', display: 'block' }}>
                <source src={item.secure_url} />
              </video>
            ) : (
              <img onClick={() => setSelected(item)} src={item.secure_url} alt={item.public_id} style={{ width: '100%', display: 'block' }} />
            )}
            {/* Download Button */}
            <button
              onClick={() => handleDownload(item.secure_url, item.public_id)}
              style={{
                position: 'absolute',
                bottom: '0.5rem',
                right: '0.5rem',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '0.4rem 0.7rem',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}>
              ⬇ Download
            </button>
          </div>
        ))}
      </div>

      {media.length === 0 && (
        <p style={{ color: 'gray', textAlign: 'center', marginTop: '4rem' }}>
          No photos yet!
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
          <span style={{ position: 'absolute', top: '1rem', right: '1.5rem', color: 'white', fontSize: '2rem' }}>✕</span>
        </div>
      )}
    </main>
  );
}