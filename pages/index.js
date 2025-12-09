import { useEffect, useState } from 'react';

function Home() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/recommendations')
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`HTTP ${res.status} ${text}`);
        }
        return res.json();
      })
      .then((data) => {
        // kalau API baliknya { recommendations: [...] }
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.recommendations)
          ? data.recommendations
          : [];

        setRecommendations(list);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Fetch Error:', error);
        setErrorMsg('Gagal memuat data rekomendasi.');
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>🎬 Rekomendasi Gadget untuk Kreator Konten</h1>
      <p>Data diambil dari file OWL menggunakan SPARQL via Vercel Serverless Function.</p>

      {loading && <p>Memuat data ontologi...</p>}

      {!loading && errorMsg && <p>{errorMsg}</p>}

      {!loading && !errorMsg && (
        <table>
          <thead>
            <tr>
              <th>Nama Gadget</th>
              <th>Sistem Operasi (OS)</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(recommendations) &&
              recommendations.map((item, index) => (
                <tr key={index}>
                  <td>
                    <strong>{item.label}</strong>
                  </td>
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
