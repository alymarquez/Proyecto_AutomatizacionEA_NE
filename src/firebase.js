import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBo5GJnx6ua-fgHq_zd5wah_4qtfyhm8qE",
  authDomain: "ne-cadu.firebaseapp.com",
  projectId: "ne-cadu",
  storageBucket: "ne-cadu.firebasestorage.app",
  messagingSenderId: "1092084919054",
  appId: "1:1092084919054:web:e76fc22f333865a383c55f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;