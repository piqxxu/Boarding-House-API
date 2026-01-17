import './bootstrap';
import './styles/index.css'; 

import { createRoot } from "react-dom/client";
import App from "./app/App"; 

const container = document.getElementById("app");

if (container) {
    const root = createRoot(container);
    root.render(<App />);
} else {
    // Kalau ini muncul di Console, berarti HTML welcome.blade.php salah
    console.error("Elemen id='app' gak ketemu. Cek welcome.blade.php!");
}