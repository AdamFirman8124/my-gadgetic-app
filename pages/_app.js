// Import file CSS global yang baru saja Anda buat
import '../styles/global.css';

// Ini adalah komponen utama pembungkus aplikasi Next.js
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}