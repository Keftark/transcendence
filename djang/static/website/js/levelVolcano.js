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
    const particleCount = 50; // Number of particles per splash
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
        velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1; // Upward motion
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    const textureLoader = new THREE.TextureLoader();
    const particleTexture = textureLoader.load('static/mat/particle.png'); 

    const material = new THREE.PointsMaterial({
        size: 0.5,
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
                //velocities[i * 3 + 1] -= 0.005; // Slow downward pull

                // If particle moves too far, reset it
                const posX = (positions[i * 3] - object.userData.origin.x) ** 2
                const posY = (positions[i * 3 + 1] - object.userData.origin.y) ** 2
                const posZ = (positions[i * 3 + 2] - object.userData.origin.z) ** 2
                const dist = Math.sqrt(posX + posY + posZ)
                if (dist > 8) { // Adjust threshold as needed
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
    velocities[index * 3 + 1] = (Math.random() - 0.5) * 0.1; // Upward motion
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

                const position = new THREE.Vector3(i * 5, BOUNDARY.Y_MAX, 0);
                model.position.copy(position);

                let nbr = getRandomNumberBetween(0.8, 1.25);
                model.matrixAutoUpdate = false;
                model.scale.set(nbr, nbr, nbr);
                model.rotation.x = 90;
                model.rotation.y = getRandomNumberBetween(0, 360);
                model.updateMatrix();
                
                const particles = createParticleSystem(position);
                particles.userData.origin = position.clone();
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

                const position = new THREE.Vector3(i * 5, BOUNDARY.Y_MIN, 0);
                model.position.copy(position);
                let nbr = getRandomNumberBetween(0.8, 1.25);
                model.matrixAutoUpdate = false;
                model.scale.set(nbr, nbr, nbr);
                model.rotation.x = 90;
                model.rotation.y = getRandomNumberBetween(0, 360);
                model.updateMatrix();
                
                const particles = createParticleSystem(position);
                particles.userData.origin = position.clone();
                scene.add(particles);
            },
            undefined,
            function (error) {
                console.error('An error occurred', error);
            }
        );
    }
        for (let i = 0; i < 8; i++)
        {
            loader.load(
                getRandomRock(),
                function (gltf) {
                    const model = gltf.scene;
                    scene.add(model);
                    setObjectRandomPosition(model);
                    let nbr = getRandomNumberBetween(0.5, 2);
                    model.matrixAutoUpdate = false;
                    model.scale.set(nbr, nbr, nbr);
                    model.rotation.x = 90;
                    model.rotation.y = getRandomNumberBetween(0, 360);
                    model.updateMatrix();
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

export function createVolcanoLevel(scene, textureLoader)
{
    drawBackground(scene, textureLoader);
    addRocks(scene);
    return animateScene;
}