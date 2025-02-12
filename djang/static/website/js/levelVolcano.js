import * as THREE from '../node_modules/.vite/deps/three.js';
import { BOUNDARY } from "./levelLocal.js";
import { GLTFLoader } from '../node_modules/.vite/deps/three_examples_jsm_loaders_GLTFLoader.js';
import { getRandomNumberBetween, getRandomStringFromArray, setObjectRandomPosition, setWallRight } from './objects.js';
import { LevelMode } from './variables.js';

let wallLeft;
let wallRight;
let wallBot;
let wallTop;
let background;

let scenic;

function createParticleSystem(position) {
    const particleCount = 20; // Number of particles per splash
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3); // Store velocities for movement

    for (let i = 0; i < particleCount; i++) {
        // Random offset around the rock
        positions[i * 3] = position.x + (Math.random() - 0.5) * 2;
        positions[i * 3 + 1] = position.y + (Math.random() - 0.5) * 2;
        positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 2;

        // Random velocities (upward and outward motion)
        velocities[i * 3] = (Math.random() - 0.5) * 0.1;
        velocities[i * 3 + 1] = Math.random() * 0.2; // Upward motion
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    // Load a small circular texture for particles
    const textureLoader = new THREE.TextureLoader();
    const particleTexture = textureLoader.load('static/mat/lava.png'); 

    const material = new THREE.PointsMaterial({
        size: 0.5, // Adjust size of particles
        map: particleTexture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(geometry, material);
    particleSystem.userData.velocities = velocities;
    particleSystem.userData.isLava = true;

    return particleSystem;
}

export function animateScene(scene)
{
    if (background && background.material.map) {
        background.material.map.offset.x += 0.0008; // Adjust speed as needed
        background.material.map.offset.y += 0.0008;
    }

    scene.traverse((object) => {
        if (object.isPoints && object.userData.isLava) {
            const positions = object.geometry.attributes.position.array;
            const velocities = object.userData.velocities;

            for (let i = 0; i < velocities.length / 3; i++) {
                positions[i * 3] += velocities[i * 3]; // X
                positions[i * 3 + 1] += velocities[i * 3 + 1]; // Y (Upward motion)
                positions[i * 3 + 2] += velocities[i * 3 + 2]; // Z

                // Apply gravity
                velocities[i * 3 + 1] -= 0.005; // Slow downward pull

                // If particle moves too far, reset it
                if (positions[i * 3 + 1] < -5) { // Adjust threshold as needed
                    resetParticle(i, positions, velocities, object.userData.origin);
                }
            }

            object.geometry.attributes.position.needsUpdate = true;
        }
    });
}

// Function to reset particle position
function resetParticle(index, positions, velocities, origin) {
    positions[index * 3] = origin.x + (Math.random() - 0.5) * 2; // Random X near rock
    positions[index * 3 + 1] = origin.y; // Reset at rock height
    positions[index * 3 + 2] = origin.z + (Math.random() - 0.5) * 2; // Random Z near rock

    velocities[index * 3] = (Math.random() - 0.5) * 0.1; // Random horizontal movement
    velocities[index * 3 + 1] = Math.random() * 0.1 + 0.05; // Upward motion
    velocities[index * 3 + 2] = (Math.random() - 0.5) * 0.1; // Random depth movement
}

function addRocks(scene)
{
    const loader = new GLTFLoader();
    for (let i = -8; i <= 8; i++)
    {
        loader.load(
            getRandomRock(),
            function (gltf) {
                const model = gltf.scene;
                scene.add(model);
                model.position.set(i * 5, BOUNDARY.Y_MAX, 0)
                let nbr = getRandomNumberBetween(0.8, 1.25);
                model.matrixAutoUpdate = false;
                model.scale.set(nbr, nbr, nbr);
                model.rotation.x = 90;
                model.rotation.y = getRandomNumberBetween(0, 360);
                model.updateMatrix();
                // Add particles around the rock
                const particles = createParticleSystem(model.position);
                particles.userData.origin = new THREE.Vector3(i * 5, BOUNDARY.Y_MAX, 0);
                scene.add(particles);
            },
            undefined,
            function (error) {
                console.error('An error occurred', error);
            }
        );
    }
    for (let i = -8; i <= 8; i++)
    {
        loader.load(
            getRandomRock(),
            function (gltf) {
                const model = gltf.scene;
                scene.add(model);
                model.position.set(i * 5, BOUNDARY.Y_MIN, 0)
                let nbr = getRandomNumberBetween(0.8, 1.25);
                model.matrixAutoUpdate = false;
                model.scale.set(nbr, nbr, nbr);
                model.rotation.x = 90;
                model.rotation.y = getRandomNumberBetween(0, 360);
                model.updateMatrix();
                // Add particles around the rock
                const particles = createParticleSystem(model.position);
                particles.userData.origin = new THREE.Vector3(i * 5, BOUNDARY.Y_MIN, 0);
                scene.add(particles);
            },
            undefined,
            function (error) {
                console.error('An error occurred', error);
            }
        );
    }
}

function getRandomRock()
{
    const paths =   
    [
        'static/3DModels/rock1.glb',
        'static/3DModels/rock2.glb',
        'static/3DModels/rock3.glb',
        'static/3DModels/rock4.glb'
    ]
    return getRandomStringFromArray(paths);
}

function drawBackground(scene, textureLoader)
{
    const geometry = new THREE.PlaneGeometry(2000, 2000);
    const texture = textureLoader.load('static/backgrounds/magoma.jpg');
    
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(64, 64); // Adjust tiling if needed

    const material = new THREE.MeshStandardMaterial({ map: texture });
    background = new THREE.Mesh(geometry, material); // Store the Mesh in `background`
    
    scene.add(background);
    background.position.set(0, 0, -3);
}

function createWalls(scene, textureLoader)
{
    const wallHeight = 1;
    const wallVerticalSize = BOUNDARY.Y_MAX * 2;
    const wallHorizontalSize = BOUNDARY.X_MAX * 2;
    const wallSizeHorizontal = wallHorizontalSize + 7;
    const wallSizeVertical = wallVerticalSize - 1;
    let texturePath = 'static/mat/lava.png';

    const cylinderTextureVertical = textureLoader.load(texturePath);

    cylinderTextureVertical.wrapS = cylinderTextureVertical.wrapT = THREE.RepeatWrapping;
    cylinderTextureVertical.repeat.set(1, 1);
    const cylinderGeometryVertical = new THREE.CylinderGeometry(wallHeight, wallHeight, wallSizeVertical, 32);
    const cylinderMaterialVertical = new THREE.MeshStandardMaterial({
        map: cylinderTextureVertical,
        transparent: true,
        opacity: 1 });
    const cylinderTextureHorizontal = textureLoader.load(texturePath);

    cylinderTextureHorizontal.wrapS = cylinderTextureHorizontal.wrapT = THREE.RepeatWrapping;
    cylinderTextureHorizontal.repeat.set(1, wallHorizontalSize / 20);
    const cylinderGeometryHorizontal = new THREE.CylinderGeometry(wallHeight * 32, wallHeight * 32, wallSizeHorizontal * 8, 32 * 8);
    const cylinderMaterialHorizontal = new THREE.MeshStandardMaterial({
        map: cylinderTextureHorizontal,
        transparent: true,
        opacity: 1 });
        
    //wallTop = new THREE.Mesh(cylinderGeometryHorizontal, cylinderMaterialHorizontal);
    //scene.add(wallTop);
    const ninetyDegrees = Math.PI / 2;
    //wallTop.position.set(0, BOUNDARY.Y_MAX + 32.5, -15);
    //wallTop.rotation.z = ninetyDegrees;
    wallBot = new THREE.Mesh(cylinderGeometryHorizontal, cylinderMaterialHorizontal);
    scene.add(wallBot);
    wallBot.position.set(0, BOUNDARY.Y_MIN - 32.5, -15);
    wallBot.rotation.z = ninetyDegrees;

    wallLeft = new THREE.Mesh(cylinderGeometryVertical, cylinderMaterialVertical);
    scene.add(wallLeft);
    wallLeft.position.set(BOUNDARY.X_MAX + 2.5, 0, 0);
    wallRight = new THREE.Mesh(cylinderGeometryVertical, cylinderMaterialVertical);
    scene.add(wallRight);
    wallRight.position.set(BOUNDARY.X_MIN - 2.5, 0, 0);
}

export function createVolcanoLevel(scene, textureLoader)
{
    drawBackground(scene, textureLoader);
    addRocks(scene);
    return animateScene;
}