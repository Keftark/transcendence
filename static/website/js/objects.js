import * as THREE from '../node_modules/.vite/deps/three.js';
import { PLAYER_HEIGHT, PLAYER_RADIUS, BOUNDARY } from "./levelLocal.js";
import { getLevelState } from "./main.js";
import { LevelMode } from './variables.js';

let wallLeft;
let wallRight;
let currentLevelMode;

export function drawLine(scene, BOUNDARY)
{
    const materialLine = new THREE.LineBasicMaterial({ color: 0xffffff });
    const points = [
      new THREE.Vector3(BOUNDARY.X_MIN - 2.5, BOUNDARY.Y_MAX, 0),
      new THREE.Vector3(BOUNDARY.X_MAX + 2.5, BOUNDARY.Y_MAX, 0),
      new THREE.Vector3(BOUNDARY.X_MAX + 2.5, BOUNDARY.Y_MIN, 0),
      new THREE.Vector3(BOUNDARY.X_MIN - 2.5, BOUNDARY.Y_MIN, 0),
      new THREE.Vector3(BOUNDARY.X_MIN - 2.5, BOUNDARY.Y_MAX, 0)
    ];
    const geometryLine = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometryLine, materialLine);
    scene.add(line);
}

export function getRandomStringFromArray(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length); // Generate a random index
    return arr[randomIndex]; // Return the string at the random index
}

export function getRandomNumberBetween(min, max) {
    return Math.random() * (max - min) + min;
}

// positions are for fullscreen
export function setObjectRandomPosition(object)
{
    let maxPosXSide = currentLevelMode === LevelMode.ADVENTURE ? 90 : 70;
    const minPosXSide = BOUNDARY.X_MAX + 10;
    let maxPosYTop = currentLevelMode === LevelMode.ADVENTURE ? 100 : 35;
    const minPosYTop = BOUNDARY.Y_MAX + 10;
    let rnd = getRandomNumberBetween(0, 4);
    rnd = Math.floor(rnd);
    let posX;
    let posY;
    if (rnd == 0) // left
    {
        posX = getRandomNumberBetween(-maxPosXSide, -minPosXSide);
        posY = getRandomNumberBetween(-maxPosYTop, maxPosYTop);
    }
    else if (rnd == 1) // top
    {
        posX = getRandomNumberBetween(-maxPosXSide, maxPosXSide);
        posY = getRandomNumberBetween(minPosYTop, maxPosYTop);
    }
    else if (rnd == 2) // right
    {
        posX = getRandomNumberBetween(minPosXSide, maxPosXSide);
        posY = getRandomNumberBetween(-maxPosYTop, maxPosYTop);
    }
    else if (rnd == 3) // bottom
    {
        posX = getRandomNumberBetween(-maxPosXSide, maxPosXSide);
        posY = getRandomNumberBetween(-maxPosYTop, -minPosYTop);
    }
    object.position.set(posX, posY, 0);
}


function createPlayerBoostModel(textureLoader)
{
    const boostTexture = textureLoader.load('static/mat/ballBoost.png');
    boostTexture.colorSpace = THREE.SRGBColorSpace;
    const boostMaterial = new THREE.MeshStandardMaterial({ 
        map:boostTexture,
        transparent: true,
        emissive: new THREE.Color(0xffff00),
        emissiveIntensity: 10,
        opacity: 1
    });
    const boostGeometry = new THREE.CylinderGeometry(PLAYER_RADIUS + 0.1, PLAYER_RADIUS + 0.1, PLAYER_HEIGHT + 0.1, 8, 1, false);
    const model = new THREE.Mesh(boostGeometry, boostMaterial);

    model.visible = false;
    return model;
}

export function createPlayers(scene, textureLoader)
{
    const levelState = getLevelState();
    const playerSize = levelState === LevelMode.MULTI ? PLAYER_HEIGHT / 1.5 : PLAYER_HEIGHT;
    const cylinderTexture = textureLoader.load('static/mat/player1.jpg'); // changer la texture en fonction du skin que le joueur choisit
    cylinderTexture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshStandardMaterial({ map: cylinderTexture });
    const geometry = new THREE.CylinderGeometry(PLAYER_RADIUS, PLAYER_RADIUS, playerSize, 8, 1, false);

    const player1 = new THREE.Mesh(geometry, material);
    const player2 = new THREE.Mesh(geometry, material);
    player1.add(createPlayerBoostModel(textureLoader));
    player2.add(createPlayerBoostModel(textureLoader));
    scene.add(player1);
    scene.add(player2);

    let player3 = null;
    let player4 = null;
    if (levelState === LevelMode.MULTI)
    {
        player3 = new THREE.Mesh(geometry, material);
        player3.add(createPlayerBoostModel(textureLoader));
        scene.add(player3);
        player4 = new THREE.Mesh(geometry, material);
        player4.add(createPlayerBoostModel(textureLoader));
        scene.add(player4);
    }

    return [player1, player2, player3, player4];
}

export function setWallRight(wall)
{
    wallRight = wall;
}

export function setVisibilityRightWall(isVisible)
{
    wallRight.visible = isVisible;
}

export function createLights(scene)
{
    currentLevelMode = getLevelState();
    const ambientLight = new THREE.AmbientLight(0xaaaaaa);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(1, 1, 1).normalize();

    scene.add(ambientLight);
    scene.add(directionalLight);
}