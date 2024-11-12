import * as THREE from 'three';
import { BOUNDARY } from "./levelLocal";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { getRandomNumberBetween, getRandomStringFromArray, setObjectRandomPosition, setWallRight } from './objects';
import { LevelMode } from './variables';

let wallLeft;
export let wallRight;
let currentLevelMode;

function getRandomRock()
{
    const paths =   
    [
        '3DModels/rock1.glb',
        '3DModels/rock2.glb',
        '3DModels/rock3.glb'
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
                model.scale.set(nbr, nbr, nbr);
                model.rotation.x = 90;
                model.rotation.y = getRandomNumberBetween(0, 360);
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
    const texture = textureLoader.load('backgrounds/cave.png');
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
    let texturePath = 'mat/cavewall.png';
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

export function createCaveLevel(scene, textureLoader)
{
    createWalls(scene, textureLoader);
    drawBackground(scene, textureLoader);
    addModels(scene, textureLoader);
    setWallRight(wallRight);
}