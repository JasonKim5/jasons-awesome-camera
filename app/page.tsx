'use client';
import { useEffect, useState } from 'react';

interface MediaItem {
  public_id: string;
  secure_url: string;
  resource_type: string;
}

export default function Home() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/photos')
      .then(res => res.json())
      .then(data => setMedia(data));
  }, []);

  const selected = selectedIndex !== null ? media[selectedIndex] : null;

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null && selectedIndex < media.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const closeLightbox = () => {
    const video = document.querySelector('video');
    if (video) video.pause();
    setSelectedIndex(null);
  };

  return (
    <main style={{ background: '#4f6d3a', minHeight: '100vh', padding: '2rem' }}>
      <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '2rem', fontSize: '3rem' }}>
        Jason's Awesome Camera
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '1rem'
      }}>
        {media.map((item, index) => (
          <div key={item.public_id}
            onClick={() => setSelectedIndex(index)}
            style={{
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'relative',
              cursor: 'pointer',
              background: '#222',
              aspectRatio: '4/3'
            }}>
            {item.resource_type === 'video' ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#333' }}>
                <img
                  src={item.secure_url.replace('/video/upload/', '/video/upload/so_0/').replace('.mp4', '.jpg')}
                  alt={item.public_id}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <span style={{
                  position: 'absolute',
                  width: '60px',
                  height: '60px',
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{
                    width: 0,
                    height: 0,
                    borderTop: '12px solid transparent',
                    borderBottom: '12px solid transparent',
                    borderLeft: '20px solid #111',
                    marginLeft: '4px'
                  }}/>
                </span>
              </div>
            ) : (
              <img
                src={item.secure_url}
                alt={item.public_id}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            )}
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
        <div onClick={closeLightbox} style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.9)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000, cursor: 'pointer'
        }}>
          {/* Previous Button */}
          {selectedIndex! > 0 && (
            <button onClick={goPrev} style={{
              position: 'absolute', left: '1rem',
              background: 'rgba(255,255,255,0.2)',
              border: 'none', borderRadius: '50%',
              width: '50px', height: '50px',
              color: 'white', fontSize: '1.5rem',
              cursor: 'pointer', zIndex: 1001
            }}>‹</button>
          )}

          {/* Media */}
          {selected.resource_type === 'video' ? (
            <video
              controls
              autoPlay
              key={selected.secure_url}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '90%', maxHeight: '90vh' }}
            >
              <source src={selected.secure_url} type="video/mp4" />
            </video>
          ) : (
            <img
              src={selected.secure_url}
              alt={selected.public_id}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '90%', maxHeight: '90vh', objectFit: 'contain' }}
            />
          )}

          {/* Next Button */}
          {selectedIndex! < media.length - 1 && (
            <button onClick={goNext} style={{
              position: 'absolute', right: '1rem',
              background: 'rgba(255,255,255,0.2)',
              border: 'none', borderRadius: '50%',
              width: '50px', height: '50px',
              color: 'white', fontSize: '1.5rem',
              cursor: 'pointer', zIndex: 1001
            }}>›</button>
          )}

          {/* Close Button */}
          <span onClick={closeLightbox} style={{
            position: 'absolute', top: '1rem', right: '1.5rem',
            color: 'white', fontSize: '2rem', cursor: 'pointer', zIndex: 1001
          }}>✕</span>

          {/* Counter */}
          <span style={{
            position: 'absolute', bottom: '1rem',
            color: 'white', fontSize: '1rem'
          }}>
            {selectedIndex! + 1} / {media.length}
          </span>
        </div>
      )}
    </main>
  );
}