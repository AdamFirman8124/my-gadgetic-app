import { useEffect, useState } from 'react';

function Home() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Memanggil Serverless Function
    fetch('/api/recommendations')
      .then(res => res.json())
      .then(data => {
        setRecommendations(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Fetch Error:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>🎬 Rekomendasi Gadget untuk Kreator Konten</h1>
      <p>Data diambil dari file OWL menggunakan SPARQL via Vercel Serverless Function.</p>
      
      {loading ? (
        <p>Memuat data ontologi...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nama Gadget</th>
              <th>Sistem Operasi (OS)</th>
            </tr>
          </thead>
          <tbody>
            {recommendations.map((item, index) => (
              <tr key={index}>
                <td>**{item.label}**</td>
                <td>{item.os}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Home;