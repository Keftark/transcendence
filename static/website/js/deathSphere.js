import * as THREE from '../node_modules/.vite/deps/three.js';

export function createDeathSphere()
{
    const textureLoader = new THREE.TextureLoader();
    const ballMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x000000
    });
    const ballGeometry = new THREE.SphereGeometry(1, 32, 32);
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);

    const ballOutGeometry = new THREE.SphereGeometry(1.05, 32, 32);
    const ballOutTexture = textureLoader.load('static/mat/deathBall.png');
    const material = new THREE.MeshStandardMaterial({
        map: ballOutTexture,
        transparent: true,
        opacity: 1
    });
    ballOutTexture.colorSpace = THREE.SRGBColorSpace;
    const extBall = new THREE.Mesh(ballOutGeometry, material);

    ball.add(extBall);
    return ball;
}