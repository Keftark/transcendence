import { PLAYER_HEIGHT, PLAYER_RADIUS, BOUNDARY } from "./levelLocal";
import { ArenaType, getArenaType } from "./main";

let wallLeft;
let wallRight;

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

function drawBackgroundSpace(scene)
{
    const loader = new THREE.TextureLoader();
    loader.load('backgrounds/space.png', function(texture) {
        scene.background = texture;
    });
    const background = new THREE.PlaneGeometry(1000, 1000);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('backgrounds/space1.png');
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

function drawBackgroundCave(scene)
{
    const background = new THREE.PlaneGeometry(BOUNDARY.X_MAX * 2 + 7, BOUNDARY.Y_MAX * 2 + 2);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('backgrounds/cave.png');
    const material =  new THREE.MeshBasicMaterial({ map: texture });
    const bg = new THREE.Mesh(background, material);
    scene.add(bg);
    bg.position.set(0, 0, -1);
}

export function drawBackground(scene)
{
    if (getArenaType() === ArenaType.SPACE)
        drawBackgroundSpace(scene);
    if (getArenaType() === ArenaType.CAVE)
        drawBackgroundCave(scene);
}

export function createPlayers(scene)
{   
    const textureLoader = new THREE.TextureLoader();
    const cylinderTexture = textureLoader.load('mat/player1.jpg'); // changer la texture en fonction du skin que le joueur choisit
    const material = new THREE.MeshStandardMaterial({ map: cylinderTexture });
    const geometry = new THREE.CylinderGeometry(PLAYER_RADIUS, PLAYER_RADIUS, PLAYER_HEIGHT, 8, 1, false);

    const player1 = new THREE.Mesh(geometry, material);
    const player2 = new THREE.Mesh(geometry, material);
    scene.add(player1);
    scene.add(player2);
    return [player1, player2];
}

export function createWalls(scene)
{
    const wallVerticalSize = BOUNDARY.Y_MAX * 2;
    const wallHorizontalSize = BOUNDARY.X_MAX * 2;
    const wallSizeHorizontal = wallHorizontalSize + 7;
    const wallSizeVertical = wallVerticalSize - 1;
    const textureLoader = new THREE.TextureLoader();
    let texturePath = '';
    if (getArenaType() === ArenaType.SPACE)
        texturePath = 'mat/scifiwall.png';
    if (getArenaType() === ArenaType.CAVE)
        texturePath = 'mat/cavewall.png';
    const sideTextureHorizontal = textureLoader.load(texturePath);
    const topTextureHorizontal = textureLoader.load(texturePath);
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
    const geometryHorizontal = new THREE.BoxGeometry(wallSizeHorizontal, 2, 5);
    const wallTop = new THREE.Mesh(geometryHorizontal, materialHorizontal);
    scene.add(wallTop);
    wallTop.position.set(0, BOUNDARY.Y_MAX + 0.5, 0);
    const wallBot = new THREE.Mesh(geometryHorizontal, materialHorizontal);
    scene.add(wallBot);
    wallBot.position.set(0, BOUNDARY.Y_MIN - 0.5, 0);

    const sideTextureVertical = textureLoader.load(texturePath);
    const topTextureVertical = textureLoader.load(texturePath);
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
    const geometryVertical = new THREE.BoxGeometry(2, wallSizeVertical, 5);
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
    const ambientLight = new THREE.AmbientLight(0xaaaaaa);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5).normalize();

    scene.add(ambientLight);
    scene.add(directionalLight);
}