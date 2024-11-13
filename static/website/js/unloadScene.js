import * as THREE from '../node_modules/.vite/deps/three.js';
import { addPlayerMovementKeyDown, addPlayerMovementKeyUp } from "./playerMovement.js";

function hideUiElements()
{
    document.getElementById('gameMenuPanel').style.display = 'none';
}

export function unloadScene(scene, renderer, animationId)
{
    scene.traverse((object) => {
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
    });

    while (scene.children.length > 0)
        scene.remove(scene.children[0]);

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