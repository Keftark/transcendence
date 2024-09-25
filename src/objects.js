import * as THREE from 'three';

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
        color: 0x000000, // Base color
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
    return {player1, player2};
}

export function createLights(scene)
{
    const ambientLight = new THREE.AmbientLight(0xaaaaaa);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5).normalize();

    scene.add(ambientLight);
    scene.add(directionalLight);
}