// Theme Toggle Functionality
(function() {
    // Initialize theme on page load
    const savedTheme = localStorage.getItem('adminTheme') || 'dark';
    const html = document.documentElement;
    
    // Apply saved theme
    if (savedTheme === 'light') {
        html.classList.add('light-theme');
    } else {
        html.classList.remove('light-theme');
    }
    
    // Update theme button icon and add event listener
    document.addEventListener('DOMContentLoaded', function() {
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            // Update icon based on current theme
            updateThemeIcon(savedTheme);
            
            // Add click handler for theme toggle
            themeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                toggleTheme();
            });
        }
    });
    
    // Toggle theme function
    function toggleTheme() {
        const currentTheme = localStorage.getItem('adminTheme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        const html = document.documentElement;
        if (newTheme === 'light') {
            html.classList.add('light-theme');
        } else {
            html.classList.remove('light-theme');
        }
        
        localStorage.setItem('adminTheme', newTheme);
        updateThemeIcon(newTheme);
    }
    
    // Update theme button icon
    function updateThemeIcon(theme) {
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            if (theme === 'light') {
                themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
            } else {
                themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
            }
        }
    }
    
    // Expose functions to global scope if needed
    window.toggleTheme = toggleTheme;
    window.updateThemeIcon = updateThemeIcon;
})();
