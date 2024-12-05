import * as THREE from '../node_modules/.vite/deps/three.js';
import { BOUNDARY } from "./levelLocal.js";
import { GLTFLoader } from '../node_modules/.vite/deps/three_examples_jsm_loaders_GLTFLoader.js';
import { getRandomNumberBetween, getRandomStringFromArray, setObjectRandomPosition, setWallRight } from './objects.js';
import { LevelMode } from './variables.js';

let wallLeft;
export let wallRight;
let currentLevelMode;

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

function addRocks(scene)
{
    const loader = new GLTFLoader();
    let nbrRocks = currentLevelMode === LevelMode.ADVENTURE ? 50 : 20;
    for (let i = 0; i < nbrRocks; i++)
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

function addModels(scene)
{
    addRocks(scene);
}


function drawBackground(scene, textureLoader)
{
    const background = new THREE.PlaneGeometry(BOUNDARY.X_MAX * 2 + 7, BOUNDARY.Y_MAX * 2 + 2);
    const texture = textureLoader.load('static/backgrounds/cave.png');
    texture.colorSpace = THREE.SRGBColorSpace;
    const material =  new THREE.MeshStandardMaterial({ map: texture });
    const bg = new THREE.Mesh(background, material);
    scene.add(bg);
    bg.position.set(0, 0, -1);
}

function createWalls(scene, textureLoader)
{
    const wallHeight = 5;
    const wallVerticalSize = BOUNDARY.Y_MAX * 2;
    const wallHorizontalSize = BOUNDARY.X_MAX * 2;
    const wallSizeHorizontal = wallHorizontalSize + 7;
    const wallSizeVertical = wallVerticalSize - 1;
    let texturePath = 'static/mat/cavewall.png';
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
    wallTop.matrixAutoUpdate = false;
    wallTop.position.set(0, BOUNDARY.Y_MAX + 0.5, 0);
    scene.add(wallTop);
    wallTop.updateMatrix();
    const wallBot = new THREE.Mesh(geometryHorizontal, materialHorizontal);
    wallBot.matrixAutoUpdate = false;
    wallBot.position.set(0, BOUNDARY.Y_MIN - 0.5, 0);
    scene.add(wallBot);
    wallBot.updateMatrix();

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
    wallLeft.matrixAutoUpdate = false;
    wallLeft.position.set(BOUNDARY.X_MAX + 2.5, 0, 0);
    scene.add(wallLeft);
    wallLeft.updateMatrix();
    wallRight = new THREE.Mesh(geometryVertical, materialVertical);
    wallRight.matrixAutoUpdate = false;
    wallRight.position.set(BOUNDARY.X_MIN - 2.5, 0, 0);
    scene.add(wallRight);
    wallRight.updateMatrix();
}

export function createCaveLevel(scene, textureLoader)
{
    createWalls(scene, textureLoader);
    drawBackground(scene, textureLoader);
    addModels(scene, textureLoader);
    setWallRight(wallRight);
}