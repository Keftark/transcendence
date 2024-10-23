import * as THREE from 'three';
import { PLAYER_HEIGHT, PLAYER_RADIUS, BOUNDARY } from "./levelLocal";
import { ArenaType, getArenaType, getLevelState, LevelMode } from "./main";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

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

function drawBackgroundSpace(scene, textureLoader)
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

function drawBackgroundCave(scene, textureLoader)
{
    const background = new THREE.PlaneGeometry(BOUNDARY.X_MAX * 2 + 7, BOUNDARY.Y_MAX * 2 + 2);
    const texture = textureLoader.load('backgrounds/cave.png');
    texture.colorSpace = THREE.SRGBColorSpace;
    const material =  new THREE.MeshBasicMaterial({ map: texture });
    const bg = new THREE.Mesh(background, material);
    scene.add(bg);
    bg.position.set(0, 0, -1);
}

function getRandomNumberBetween(min, max) {
    return Math.random() * (max - min) + min;
}

// positions are for fullscreen
function setObjectRandomPosition(object)
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

function getRandomStringFromArray(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length); // Generate a random index
    return arr[randomIndex]; // Return the string at the random index
}

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
    
                // Optional: Adjust model
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

export function addModels(scene)
{
    if (getArenaType() === ArenaType.SPACE)
        ;
    if (getArenaType() === ArenaType.CAVE)
        addRocks(scene);
}

export function drawBackground(scene, textureLoader)
{
    if (getArenaType() === ArenaType.SPACE)
        drawBackgroundSpace(scene, textureLoader);
    if (getArenaType() === ArenaType.CAVE)
        drawBackgroundCave(scene, textureLoader);
}

export function createPlayers(scene, textureLoader)
{   
    const cylinderTexture = textureLoader.load('mat/player1.jpg'); // changer la texture en fonction du skin que le joueur choisit
    cylinderTexture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshStandardMaterial({ map: cylinderTexture });
    const geometry = new THREE.CylinderGeometry(PLAYER_RADIUS, PLAYER_RADIUS, PLAYER_HEIGHT, 8, 1, false);

    const player1 = new THREE.Mesh(geometry, material);
    const player2 = new THREE.Mesh(geometry, material);
    scene.add(player1);
    scene.add(player2);
    return [player1, player2];
}

function getWallHeight(arenaType)
{
    if (arenaType === ArenaType.CAVE)
        return 5;
    if (arenaType === ArenaType.SPACE)
        return 1;
}

export function createWalls(scene, textureLoader)
{
    const arenaType = getArenaType();
    const wallHeight = getWallHeight(arenaType);
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
    const topMaterialVertical = new THREE.MeshStandardMaterial({ map: 
        topTextureVertical,
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