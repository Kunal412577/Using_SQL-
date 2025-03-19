document.querySelectorAll('.customize-btn').forEach(button => {
    button.addEventListener('click', (event) => {
        const panel = document.querySelector('.customization-panel');
        panel.classList.add('active');
    });
});

document.querySelector('.close-panel').addEventListener('click', () => {
    document.querySelector('.customization-panel').classList.remove('active');
});