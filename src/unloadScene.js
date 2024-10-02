import { addPlayerMovementKeyDown, addPlayerMovementKeyUp } from "./playerMovement";

function hideUiElements()
{
    const pressPlayDiv = document.getElementById('pressplay');
    const playDiv = document.getElementById('play');
    const playerLeft = document.getElementById('playername-left');
    const playerRight = document.getElementById('playername-right');
    const scoreLeft = document.getElementById('score-left');
    const scoreRight = document.getElementById('score-right');
    const menuPanel = document.getElementById('menuPanel');
    pressPlayDiv.style.display = 'none';
    playDiv.style.display = 'none';
    playerLeft.style.display = 'none';
    playerRight.style.display = 'none';
    scoreLeft.style.display = 'none';
    scoreRight.style.display = 'none';
    menuPanel.style.display = 'none';
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