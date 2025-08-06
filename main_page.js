// Customize panel logic
document.querySelectorAll('.customize-btn').forEach(button => {
    button.addEventListener('click', (event) => {
        const panel = document.querySelector('.customization-panel');
        panel.classList.add('active');
    });
});

document.querySelector('.close-panel').addEventListener('click', () => {
    document.querySelector('.customization-panel').classList.remove('active');
});

// Reorder panel functionality
const reorderLink = document.getElementById('reorderLink');
const reorderPanel = document.getElementById('reorderPanel');

if (reorderLink && reorderPanel) {
    reorderLink.addEventListener('click', (event) => {
        event.preventDefault();
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            window.location.href = 'login_page.html';
            return;
        }
        reorderPanel.classList.add('active');
    });
}

// Close panels when clicking outside
window.addEventListener('click', function (e) {
    // Close customization panel
    const customizationPanel = document.querySelector('.customization-panel');
    if (customizationPanel && customizationPanel.classList.contains('active') && 
        !customizationPanel.contains(e.target) && !e.target.matches('.customize-btn')) {
        customizationPanel.classList.remove('active');
    }

    // Close reorder panel
    if (reorderPanel && reorderPanel.classList.contains('active') && 
        !reorderPanel.contains(e.target) && !e.target.matches('#reorderLink')) {
        reorderPanel.classList.remove('active');
    }
});