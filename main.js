import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const CONFIG = { scale: 30, pScale: 3 }; 
const PLANETS = {
    Mercury: { a: 0.387, e: 0.205, i: 7.00,  L: 252.2, w: 77.4,  color: 0xA5A5A5, size: 0.38 },
    Venus:   { a: 0.723, e: 0.007, i: 3.39,  L: 181.9, w: 131.5, color: 0xE3BB76, size: 0.95 },
    Earth:   { a: 1.000, e: 0.017, i: 0.00,  L: 100.4, w: 102.9, color: 0x22A6F2, size: 1.00 },
    Mars:    { a: 1.524, e: 0.093, i: 1.85,  L: 355.4, w: 336.0, color: 0xDD4C22, size: 0.53 },
    Jupiter: { a: 5.203, e: 0.048, i: 1.30,  L: 34.4,  w: 14.7,  color: 0xD8CA9D, size: 11.2 },
    Saturn:  { a: 9.537, e: 0.054, i: 2.49,  L: 49.9,  w: 92.4,  color: 0xEAD6B8, size: 9.45 },
    Uranus:  { a: 19.19, e: 0.047, i: 0.77,  L: 313.2, w: 170.9, color: 0xD1F5F7, size: 4.0 },
    Neptune: { a: 30.07, e: 0.009, i: 1.77,  L: 304.8, w: 44.9,  color: 0x3E54E8, size: 3.8 }
};

let scene, camera, renderer, controls;
const planetMeshes = {};
const layers = {
    'Planets': new THREE.Group(),
    'Orbits': new THREE.Group(),
    'Asteroids': new THREE.Group(),
    'Stars': new THREE.Group()
};
const layerState = { Planets: true, Orbits: true, Asteroids: true, Labels: true, Stars: true };

init();

function init() {
    try {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 5000);
        camera.position.set(0, 80, 150);

        renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('webgl'), antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.maxDistance = 2000;

        Object.values(layers).forEach(g => scene.add(g));

        createLighting();
        createSun();
        createPlanets();
        createAsteroids();
        createStars();
        
        setupUI();
        
        animate();

    } catch(e) {
        console.error(e);
    }
}

function createLighting() {
    scene.add(new THREE.AmbientLight(0x333333));
    const sunLight = new THREE.PointLight(0xffffff, 2, 3000);
    scene.add(sunLight);
}

function createSun() {
    const geo = new THREE.SphereGeometry(6, 32, 32);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffdd00 });
    const sun = new THREE.Mesh(geo, mat);
    const glow = new THREE.Mesh(
        new THREE.SphereGeometry(8, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.25, side: THREE.BackSide })
    );
    sun.add(glow);
    layers.Planets.add(sun);
}

function createPlanets() {
    const labelContainer = document.getElementById('labels');

    for (const [name, data] of Object.entries(PLANETS)) {
        const size = Math.log(data.size + 1) * CONFIG.pScale; 
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(size, 32, 32),
            new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.8 })
        );
        mesh.userData = { name, data };
        planetMeshes[name] = mesh;
        layers.Planets.add(mesh);

        if(name === 'Saturn') {
            const ring = new THREE.Mesh(
                new THREE.RingGeometry(size*1.3, size*2, 32),
                new THREE.MeshBasicMaterial({ color: 0xccbba6, side: THREE.DoubleSide, transparent:true, opacity:0.6 })
            );
            ring.rotation.x = Math.PI/2;
            mesh.add(ring);
        }

        const orbitPts = [];
        const r = data.a * CONFIG.scale;
        for(let i=0; i<=64; i++) {
            const theta = (i/64) * Math.PI * 2;
            orbitPts.push(new THREE.Vector3( Math.cos(theta)*r, 0, Math.sin(theta)*r ));
        }
        const line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(orbitPts),
            new THREE.LineBasicMaterial({ color: 0x444444 })
        );
        line.rotation.x = THREE.MathUtils.degToRad(data.i);
        line.rotation.z = THREE.MathUtils.degToRad(data.i);
        layers.Orbits.add(line);

        const label = document.createElement('div');
        label.className = 'p-label';
        label.innerText = name;
        labelContainer.appendChild(label);
        mesh.userData.label = label;
    }
}

function createAsteroids() {
    const geo = new THREE.BufferGeometry();
    const pos = [];
    for(let i=0; i<2000; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = (2.2 + Math.random() * 1.0) * CONFIG.scale;
        const y = (Math.random() - 0.5) * 4;
        pos.push(Math.cos(angle)*r, y, Math.sin(angle)*r);
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0x666666, size: 0.8 });
    layers.Asteroids.add(new THREE.Points(geo, mat));
}

function createStars() {
    const geo = new THREE.BufferGeometry();
    const pos = [];
    for(let i=0; i<3000; i++) {
        pos.push(
            THREE.MathUtils.randFloatSpread(4000),
            THREE.MathUtils.randFloatSpread(4000),
            THREE.MathUtils.randFloatSpread(4000)
        );
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    layers.Stars.add(new THREE.Points(geo, new THREE.PointsMaterial({color:0xffffff, size:1.5})));
}

function updatePlanets() {
    const time = Date.now() * 0.0001;
    document.getElementById('date-text').innerText = new Date().toUTCString().split('GMT')[0];

    for(const [name, mesh] of Object.entries(planetMeshes)) {
        const data = mesh.userData.data;
        const speed = 1 / Math.sqrt(Math.pow(data.a, 3));
        const angle = time * speed + data.L;
        
        const r = data.a * CONFIG.scale;
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;

        mesh.position.set(x, 0, z);

        if(layerState.Labels) {
            const tempV = mesh.position.clone();
            tempV.project(camera);
            const lx = (tempV.x * .5 + .5) * window.innerWidth;
            const ly = (tempV.y * -.5 + .5) * window.innerHeight;
            
            if(tempV.z < 1 && Math.abs(tempV.x) < 1.1 && Math.abs(tempV.y) < 1.1) {
                mesh.userData.label.style.display = 'block';
                mesh.userData.label.style.transform = `translate(${lx}px, ${ly}px) translate(-50%, -150%)`;
            } else {
                mesh.userData.label.style.display = 'none';
            }
        } else {
            mesh.userData.label.style.display = 'none';
        }
    }
}

function setupUI() {
    const menu = document.getElementById('layers-menu');
    Object.keys(layerState).forEach(key => {
        const row = document.createElement('div');
        row.className = 'layer-row on';
        row.innerHTML = `<div class="cb"></div> <div class="layer-label">${key}</div>`;
        row.onclick = () => {
            layerState[key] = !layerState[key];
            row.className = layerState[key] ? 'layer-row on' : 'layer-row';
            
            if(layers[key]) layers[key].visible = layerState[key];
        };
        menu.appendChild(row);
    });

    document.getElementById('btn-layers').onclick = (e) => {
        menu.classList.toggle('show');
        e.target.classList.toggle('active');
    };
    
    document.getElementById('btn-reset').onclick = () => {
        controls.reset();
        camera.position.set(0, 80, 150);
    };

    document.getElementById('btn-zoom-in').onclick = () => {
        camera.position.multiplyScalar(0.8);
    };

    document.getElementById('btn-zoom-out').onclick = () => {
        camera.position.multiplyScalar(1.2);
    };
    
    document.getElementById('btn-info').onclick = (e) => {
        const info = document.getElementById('info-panel');
        info.style.display = info.style.display === 'block' ? 'none' : 'block';
        e.target.classList.toggle('active');
    };

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function animate() {
    requestAnimationFrame(animate);
    updatePlanets();
    controls.update();
    renderer.render(scene, camera);
}
