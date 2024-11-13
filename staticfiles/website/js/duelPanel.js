
document.getElementById('leaveDuelButton').addEventListener('click', () => {
    resetDuel();
});

export function openDuelPanel()
{
    void document.getElementById('vsImg').offsetWidth;
    document.getElementById('vsImg').classList.add('vsAnim');
    document.getElementById('duelPanel').style.display = 'flex';
}

export function closeDuelPanel()
{
    document.getElementById('duelPanel').style.display = 'none';
    document.getElementById('vsImg').classList.remove('vsAnim');
}

export function resetDuel()
{
    closeDuelPanel();
    openDuelPanel();
}
