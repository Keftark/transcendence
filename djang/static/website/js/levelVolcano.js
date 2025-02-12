import * as THREE from '../node_modules/.vite/deps/three.js';
import { BOUNDARY } from "./levelLocal.js";
import { setWallRight } from './objects.js';

let wallLeft;
let wallRight;
let wallBot;
let wallTop;
let background;

export function animateScene()
{
    wallLeft.rotation.y -= 0.02;
    wallRight.rotation.y += 0.02;
    wallBot.rotation.x -= 0.02;
    wallTop.rotation.x += 0.02;
    if (background && background.material.map) {
        background.material.map.offset.x += 0.0002; // Adjust speed as needed
    }
}

// function addModels(scene)
// {
    
// }

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
    const texture = textureLoader.load('static/backgrounds/magoma.png');
    
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2); // Adjust tiling if needed

    const material = new THREE.MeshStandardMaterial({ map: texture });
    background = new THREE.Mesh(geometry, material); // Store the Mesh in `background`
    
    scene.add(background);
    background.position.set(0, 0, -100);
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
    const cylinderGeometryHorizontal = new THREE.CylinderGeometry(wallHeight, wallHeight, wallSizeHorizontal, 32);
    const cylinderMaterialHorizontal = new THREE.MeshStandardMaterial({
        map: cylinderTextureHorizontal,
        transparent: true,
        opacity: 1 });
        
    wallTop = new THREE.Mesh(cylinderGeometryHorizontal, cylinderMaterialHorizontal);
    scene.add(wallTop);
    const ninetyDegrees = Math.PI / 2;
    wallTop.position.set(0, BOUNDARY.Y_MAX + 0.5, 0);
    wallTop.rotation.z = ninetyDegrees;
    wallBot = new THREE.Mesh(cylinderGeometryHorizontal, cylinderMaterialHorizontal);
    scene.add(wallBot);
    wallBot.position.set(0, BOUNDARY.Y_MIN - 0.5, 0);
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
    createWalls(scene, textureLoader);
    drawBackground(scene, textureLoader);
    // addModels(scene, textureLoader);
    setWallRight(wallRight);
    return animateScene;
}