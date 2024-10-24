import * as THREE from 'three';
import { PLAYER_HEIGHT, PLAYER_RADIUS, BOUNDARY } from "./levelLocal";
import { ArenaType, getArenaType, getLevelState, LevelMode } from "./main";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { setWallRight } from './objects';

let wallLeft;
let wallRight;
let currentLevelMode;

function addModels(scene)
{
    
}

function drawBackground(scene, textureLoader)
{
    textureLoader.load('backgrounds/space.png', function(texture) {
        texture.colorSpace = THREE.SRGBColorSpace;
        scene.background = texture;
    });
    const background = new THREE.PlaneGeometry(1000, 1000);
    const texture = textureLoader.load('backgrounds/space1.png');
    texture.encoding = THREE.sRGBEncoding;
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 1
    });
    const bg = new THREE.Mesh(background, material);
    scene.add(bg);
    bg.position.set(0, 0, -500);
    const texture2 = textureLoader.load('backgrounds/space2.png');
    const material2 = new THREE.MeshBasicMaterial({
        map: texture2,
        transparent: true,
        opacity: 1
    });
    const bg2 = new THREE.Mesh(background, material2);
    scene.add(bg2);
    bg2.position.set(0, 0, -300);
}

function createWalls(scene, textureLoader)
{
    const arenaType = getArenaType();
    const wallHeight = 1;
    const wallVerticalSize = BOUNDARY.Y_MAX * 2;
    const wallHorizontalSize = BOUNDARY.X_MAX * 2;
    const wallSizeHorizontal = wallHorizontalSize + 7;
    const wallSizeVertical = wallVerticalSize - 1;
    let texturePath = '';
    if (arenaType === ArenaType.SPACE)
        texturePath = 'mat/scifiwall.png';
    if (arenaType === ArenaType.CAVE)
        texturePath = 'mat/cavewall.png';
    const sideTextureHorizontal = textureLoader.load(texturePath);
    sideTextureHorizontal.colorSpace = THREE.SRGBColorSpace;
    const topTextureHorizontal = textureLoader.load(texturePath);
    topTextureHorizontal.colorSpace = THREE.SRGBColorSpace;
    sideTextureHorizontal.wrapS = sideTextureHorizontal.wrapT = THREE.RepeatWrapping;
    sideTextureHorizontal.repeat.set(wallHorizontalSize / 9, 1);
    topTextureHorizontal.wrapS = topTextureHorizontal.wrapT = THREE.RepeatWrapping;
    topTextureHorizontal.repeat.set(wallHorizontalSize / 8, 0.25);
    const sideMaterial = new THREE.MeshStandardMaterial({
        map: sideTextureHorizontal,
        transparent: true,
        opacity: 1 });
    const topMaterial = new THREE.MeshStandardMaterial({
        map: topTextureHorizontal,
        transparent: true,
        opacity: 1 });
    const materialHorizontal = [
        sideMaterial,
        sideMaterial,
        sideMaterial,
        sideMaterial,
        topMaterial,
        topMaterial
    ];
    const geometryHorizontal = new THREE.BoxGeometry(wallSizeHorizontal, 2, wallHeight);
    const wallTop = new THREE.Mesh(geometryHorizontal, materialHorizontal);
    scene.add(wallTop);
    wallTop.position.set(0, BOUNDARY.Y_MAX + 0.5, 0);
    const wallBot = new THREE.Mesh(geometryHorizontal, materialHorizontal);
    scene.add(wallBot);
    wallBot.position.set(0, BOUNDARY.Y_MIN - 0.5, 0);

    const sideTextureVertical = textureLoader.load(texturePath);
    sideTextureVertical.colorSpace = THREE.SRGBColorSpace;
    const topTextureVertical = textureLoader.load(texturePath);
    topTextureVertical.colorSpace = THREE.SRGBColorSpace;
    sideTextureVertical.rotation = Math.PI / 2;
    topTextureVertical.rotation = Math.PI / 2;
    sideTextureVertical.wrapS = sideTextureVertical.wrapT = THREE.RepeatWrapping;
    sideTextureVertical.repeat.set(wallVerticalSize / 10, 1);
    topTextureVertical.wrapS = topTextureVertical.wrapT = THREE.RepeatWrapping;
    topTextureVertical.repeat.set(wallVerticalSize / 10, 0.25);
    const sideMaterialVertical = new THREE.MeshStandardMaterial({ 
        map: sideTextureVertical,
        transparent: true,
        opacity: 1 });
    const topMaterialVertical = new THREE.MeshStandardMaterial({
        map: topTextureVertical,
        transparent: true,
        opacity: 1 });
    const materialVertical = [
        sideMaterialVertical,
        sideMaterialVertical,
        sideMaterialVertical,
        sideMaterialVertical,
        topMaterialVertical,
        topMaterialVertical
    ];
    const geometryVertical = new THREE.BoxGeometry(2, wallSizeVertical, wallHeight);
    wallLeft = new THREE.Mesh(geometryVertical, materialVertical);
    scene.add(wallLeft);
    wallLeft.position.set(BOUNDARY.X_MAX + 2.5, 0, 0);
    wallRight = new THREE.Mesh(geometryVertical, materialVertical);
    scene.add(wallRight);
    wallRight.position.set(BOUNDARY.X_MIN - 2.5, 0, 0);
}

export function createSpaceLevel(scene, textureLoader)
{
    createWalls(scene, textureLoader);
    drawBackground(scene, textureLoader);
    addModels(scene, textureLoader);
    setWallRight(wallRight);
}