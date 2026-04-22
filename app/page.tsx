'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [media, setMedia] = useState([]);

  useEffect(() => {
    fetch('/api/photos')
      .then(res => res.json())
      .then(data => setMedia(data));
  }, []);

  return (
    <main style={{ background: '#4f6d3a', minHeight: '100vh', padding: '2rem' }}>
      <h1 style={{ 
        color: 'white', 
        textAlign: 'center', 
        marginBottom: '2rem', 
        fontSize: '3rem' 
      }}>
        Jason's Awesome Camera
      </h1>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '1rem'
      }}>
        {media.map((item) => (
          <div key={item.public_id} style={{ borderRadius: '8px', overflow: 'hidden' }}>
            {item.resource_type === 'video' ? (
              <video controls style={{ width: '100%', display: 'block' }}>
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
          No photos yet — upload some to Cloudinary to get started!
        </p>
      )}
    </main>
  );
}