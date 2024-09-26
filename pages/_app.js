// pages/_app.js
import '../styles/global.css'; // Adjust path based on your file structure

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
