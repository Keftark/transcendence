import * as THREE from 'https://unpkg.com/three@0.146.0/build/three.module.js';
import { BOUNDARY } from "./levelLocal.js";

export class Sparks {
    constructor(scene) {
        this.particleGroups = [];
        this.scene = scene;  // The scene to which particles will be added
    }

    createSparks(position, count = 100) {
        const particles = new THREE.BufferGeometry();
        const positions = [];
        const velocities = [];

        // Generate particle positions and velocities
        for (let i = 0; i < count; i++) {
            const x = position.x + (Math.random() - 0.5) * 2;
            const y = position.y + (Math.random() - 0.5) * 2;
            const z = position.z + (Math.random() - 0.5) * 2;

            positions.push(x, y, z);

            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.1 * count/30,
                (Math.random() - 0.5) * 0.1 * count/30,
                (Math.random() - 0.5) * 0.1 * count/30
            );
            velocities.push(velocity);
        }

        particles.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        // Material for the particles
        const material = new THREE.PointsMaterial({
            color: 0xff5500,
            size: 0.25,
            transparent: true,
            opacity: 1.0
        });

        const sparkSystem = new THREE.Points(particles, material);
        sparkSystem.userData = { velocities, lifetime: 2 };

        this.scene.add(sparkSystem);
        this.particleGroups.push(sparkSystem);
    }

    updateSparks() {
        for (let i = this.particleGroups.length - 1; i >= 0; i--) {
            const sparkGroup = this.particleGroups[i];
            const { velocities, lifetime } = sparkGroup.userData;

            const positions = sparkGroup.geometry.attributes.position.array;
            for (let j = 0; j < velocities.length; j++) {
                const velocity = velocities[j];

                positions[j * 3] += velocity.x * 15;
                positions[j * 3 + 1] += velocity.y * 5;
                positions[j * 3 + 2] += velocity.z;
                if (positions[j * 3] > BOUNDARY.X_MAX || positions[j * 3] < BOUNDARY.X_MIN || 
                    positions[j * 3 + 1] > BOUNDARY.Y_MAX || positions[j * 3 + 1] < BOUNDARY.Y_MIN)
                {
                    positions[j * 3] = NaN;
                    positions[j * 3 + 1] = NaN;
                    positions[j * 3 + 2] = NaN;
                }
                velocity.multiplyScalar(0.98);
            }

            sparkGroup.geometry.attributes.position.needsUpdate = true;

            sparkGroup.material.opacity = Math.max(0, sparkGroup.material.opacity - 0.075);

            sparkGroup.userData.lifetime -= 0.04 * velocities.x;
            if (sparkGroup.userData.lifetime <= 0) {
                this.scene.remove(sparkGroup);
                this.particleGroups.splice(i, 1);
            }
        }
    }

    // Call this function to spawn sparks
    spawnSparks(position, nbr) {
        this.createSparks(position, nbr);
    }
}
