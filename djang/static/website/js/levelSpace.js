import * as THREE from '../node_modules/.vite/deps/three.js';
import { BOUNDARY } from "./levelLocal.js";
import { setWallRight } from './objects.js';

let wallLeft;
let wallRight;
let wallBot;
let wallTop;

export function animateScene()
{
    wallLeft.rotation.y -= 0.02;
    wallRight.rotation.y += 0.02;
    wallBot.rotation.x -= 0.02;
    wallTop.rotation.x += 0.02;
}

function addModels(scene)
{
    
}

function drawBackground(scene, textureLoader)
{
    textureLoader.load('static/backgrounds/space.png', function(texture) {
        texture.colorSpace = THREE.SRGBColorSpace;
        scene.background = texture;
    });
    const background = new THREE.PlaneGeometry(1000, 1000);
    const texture = textureLoader.load('static/backgrounds/space1.png');
    // texture.encoding = THREE.sRGBEncoding;
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 1
    });
    const bg = new THREE.Mesh(background, material);
    scene.add(bg);
    bg.position.set(0, 0, -500);
    const texture2 = textureLoader.load('static/backgrounds/space2.png');
    const material2 = new THREE.MeshBasicMaterial({
        map: texture2,
        transparent: true,
        opacity: 1
    });
    const bg2 = new THREE.Mesh(background, material2);
    scene.add(bg2);
    bg2.position.set(0, 0, -300);

    const backgroundTop = new THREE.PlaneGeometry(BOUNDARY.X_MAX * 2 + 7, BOUNDARY.Y_MAX * 2 + 2);
    const textureTop = textureLoader.load('static/backgrounds/bgSpaceTop.png');
    texture.colorSpace = THREE.SRGBColorSpace;
    const materialTop =  new THREE.MeshStandardMaterial({ 
        map: textureTop ,
        transparent: true,
        opacity: 1
    });
    const bgTop = new THREE.Mesh(backgroundTop, materialTop);
    scene.add(bgTop);
    bgTop.position.set(0, 0, -1);
}

function createWalls(scene, textureLoader)
{
    const wallHeight = 1;
    const wallVerticalSize = BOUNDARY.Y_MAX * 2;
    const wallHorizontalSize = BOUNDARY.X_MAX * 2;
    const wallSizeHorizontal = wallHorizontalSize + 7;
    const wallSizeVertical = wallVerticalSize - 1;
    let texturePath = 'static/mat/scifiwall.png';

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

export function createSpaceLevel(scene, textureLoader)
{
    createWalls(scene, textureLoader);
    drawBackground(scene, textureLoader);
    addModels(scene, textureLoader);
    setWallRight(wallRight);
    return animateScene;
}