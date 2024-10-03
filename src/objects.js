
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

export function drawBackground(scene)
{
    const background = new THREE.PlaneGeometry(1000, 1000);
    const bgMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x171717,
            roughness: 1 // Base color
    });
    const bg = new THREE.Mesh(background, bgMaterial);
    scene.add(bg);
    bg.position.set(0, 0, -1);
}

export function createPlayers(scene, PLAYER_RADIUS, PLAYER_HEIGHT)
{   
    const textureLoader = new THREE.TextureLoader();
    const cylinderTexture = textureLoader.load('mat/player1.jpg');
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
    const textureLoader = new THREE.TextureLoader();
    const sideTextureHorizontal = textureLoader.load('mat/wall.jpg');
    const topTextureHorizontal = textureLoader.load('mat/wall.jpg');
    sideTextureHorizontal.wrapS = sideTextureHorizontal.wrapT = THREE.RepeatWrapping;
    sideTextureHorizontal.repeat.set(12, 0.5);
    topTextureHorizontal.wrapS = topTextureHorizontal.wrapT = THREE.RepeatWrapping;
    topTextureHorizontal.repeat.set(12, 0.25);
    const sideMaterial = new THREE.MeshStandardMaterial({ map: sideTextureHorizontal });
    const topMaterial = new THREE.MeshStandardMaterial({ map: topTextureHorizontal });
    const materialHorizontal = [
        sideMaterial,
        sideMaterial,
        sideMaterial,
        sideMaterial,
        topMaterial,
        topMaterial
    ];
    const geometryHorizontal = new THREE.BoxGeometry(87, 2, 5);
    const wallTop = new THREE.Mesh(geometryHorizontal, materialHorizontal);
    scene.add(wallTop);
    wallTop.position.set(0, 25.5, 0);
    const wallBot = new THREE.Mesh(geometryHorizontal, materialHorizontal);
    scene.add(wallBot);
    wallBot.position.set(0, -25.5, 0);

    const sideTextureVertical = textureLoader.load('mat/wall.jpg');
    const topTextureVertical = textureLoader.load('mat/wall.jpg');
    sideTextureVertical.rotation = Math.PI / 2;
    topTextureVertical.rotation = Math.PI / 2;
    sideTextureVertical.wrapS = sideTextureVertical.wrapT = THREE.RepeatWrapping;
    sideTextureVertical.repeat.set(7, 0.5);
    topTextureVertical.wrapS = topTextureVertical.wrapT = THREE.RepeatWrapping;
    topTextureVertical.repeat.set(7, 0.25);
    const sideMaterialVertical = new THREE.MeshStandardMaterial({ map: sideTextureVertical });
    const topMaterialVertical = new THREE.MeshStandardMaterial({ map: topTextureVertical });
    const materialVertical = [
        sideMaterialVertical,
        sideMaterialVertical,
        sideMaterialVertical,
        sideMaterialVertical,
        topMaterialVertical,
        topMaterialVertical
    ];
    const geometryVertical = new THREE.BoxGeometry(2, 49, 5);
    const wallLeft = new THREE.Mesh(geometryVertical, materialVertical);
    scene.add(wallLeft);
    wallLeft.position.set(42.5, 0, 0);
    const wallRight = new THREE.Mesh(geometryVertical, materialVertical);
    scene.add(wallRight);
    wallRight.position.set(-42.5, 0, 0);
}

export function createLights(scene)
{
    const ambientLight = new THREE.AmbientLight(0xaaaaaa);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5).normalize();

    scene.add(ambientLight);
    scene.add(directionalLight);
}