// Where is the Flask backend?
// A static website cannot read server environment variables, so the backend
// address lives in this one small file. It is a public URL, not a secret.
//
// 1. Running on your computer  -> uses the local Flask server automatically.
// 2. Deployed (Vercel/Netlify) -> uses PRODUCTION_API_URL. Replace it with your
//    Render backend URL after you deploy the backend (no trailing slash).
const PRODUCTION_API_URL = "https://YOUR-BACKEND-NAME.onrender.com";
const LOCAL_API_URL = "http://127.0.0.1:5000";

const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);

window.APP_CONFIG = {
  API_BASE_URL: isLocal ? LOCAL_API_URL : PRODUCTION_API_URL,
};
