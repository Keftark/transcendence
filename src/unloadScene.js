import * as THREE from 'three';
import { addPlayerMovementKeyDown, addPlayerMovementKeyUp } from "./playerMovement";

function hideUiElements()
{
    document.getElementById('pressplay').style.display = 'none';
    document.getElementById('play').style.display = 'none';
    document.getElementById('playername-left').style.display = 'none';
    document.getElementById('playername-right').style.display = 'none';
    document.getElementById('score-left').style.display = 'none';
    document.getElementById('score-right').style.display = 'none';
    document.getElementById('menuPanel').style.display = 'none';
    document.getElementById('controlsP1LocalImg').style.display = 'none';
    document.getElementById('controlsP2LocalImg').style.display = 'none';
    document.getElementById('controlsAdventureImg').style.display = 'none';
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