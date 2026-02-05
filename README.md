# 🪐 Mobile Solar System 3D

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Three.js](https://img.shields.io/badge/Three.js-r160-black)
![Status](https://img.shields.io/badge/Status-Production-success)

A production-grade, mobile-first 3D Solar System explorer featuring real-time Keplerian orbits, NASA-style UI, layers management, and sensor integration. Built with modern JavaScript and Three.js.

🔗 **Live Demo:** [https://solarsystemkd.vercel.app/](https://solarsystemkd.vercel.app/)

---

## ✨ Key Features

* **🔭 Scientifically Accurate Orbits:** Planets move based on real Keplerian orbital elements (Eccentricity, Semi-Major Axis, Inclination) calculated relative to the J2000 epoch.
* **📱 Mobile-First Design:** Optimized controls for touch devices, including pinch-to-zoom and touch-drag rotation.
* **🧭 Sensor Integration:**
    * **Gyroscope/Device Orientation:** Tilt your phone to look around the solar system (requires permission on iOS).
    * **GPS/Geolocation:** Displays user coordinates relative to the simulation context.
* **🎛️ NASA-Style UI:**
    * Translucent "Glassmorphism" sidebars.
    * Layer management system (Toggle Planets, Orbits, Asteroids, Stars, Labels).
    * Real-time date/time scrubber visualization.
* **🚀 Performance Optimized:** Uses efficient geometry and texture management to ensure 60FPS on mobile browsers.
* **🌑 Fail-Safe Rendering:** Includes CSS fallbacks and error handling for unsupported devices.

## 🛠️ Tech Stack

* **Core:** HTML5, CSS3, JavaScript (ES6+ Modules)
* **3D Engine:** [Three.js](https://threejs.org/) (via CDN)
* **Math:** Custom Keplerian orbital algorithms
* **Deployment:** Vercel

## 📂 Project Structure

```text
mobile-solar-system-3d/
├── index.html      # Main entry point and DOM structure
├── style.css       # CSS Variables, Animations, and Responsive UI
├── main.js         # Three.js logic, Orbital Math, and Event Listeners
└── README.md       # Documentation
