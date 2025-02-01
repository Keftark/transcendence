import * as THREE from '../node_modules/.vite/deps/three.js';
import { unsetTextures } from './objects.js';
import { addPlayerMovementKeyDown, addPlayerMovementKeyUp } from "./playerMovement.js";

function hideUiElements()
{
    document.getElementById('gameMenuPanel').style.display = 'none';
}

export function removeModelFromObject(object)
{
    if (object instanceof THREE.Mesh)
    {
        if (object.geometry) object.geometry.dispose();
        if (object.material)
        {
            if (Array.isArray(object.material))
            {
                object.material.forEach((material) => {
                    if (material.map) material.map.dispose();
                    material.dispose();
                });
            }
            else
            {
                if (object.material.map) object.material.map.dispose();
                object.material.dispose();
            }
        }
    }
}

export function clearObject(object) {
    while (object.children.length > 0) {
        const child = object.children.pop();
        clearObject(child); // Recursively clear children
        removeModelFromObject(child); // Dispose of geometry and materials
    }
}

export function unloadScene(scene, renderer, animationId)
{
    if (!scene)
        return;
    scene.traverse((object) => {
        removeModelFromObject(object);
    });

    while (scene.children.length > 0)
        scene.remove(scene.children[0]);
    unsetTextures();
    cancelAnimationFrame(animationId);
    renderer.clear();
    renderer.dispose();
    const canvas = renderer.domElement;
    if (canvas && canvas.parentNode)
        canvas.parentNode.removeChild(canvas);
    scene.clear();
    scene = null;
    document.removeEventListener('keydown', addPlayerMovementKeyDown);
    document.removeEventListener('keyup', addPlayerMovementKeyUp);
    hideUiElements();
}