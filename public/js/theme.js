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
    
    function initTheme() {
        const themeBtns = [
            document.getElementById('themeToggle'),
            document.getElementById('themeToggleGlobal'),
            document.getElementById('themeToggleEngineer'),
            document.getElementById('themeToggleGlobalEngineer')
        ];

        // Update icon based on current theme
        updateThemeIcon(savedTheme);
        
        themeBtns.forEach(function(themeBtn) {
            if (themeBtn && !themeBtn.dataset.themeInit) {
                themeBtn.dataset.themeInit = "true"; // Prevent duplicate listeners
                // Add click handler for theme toggle
                themeBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    toggleTheme();
                });
            }
        });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
    
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
        const iconHtml = theme === 'light' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        const btns = [
            document.getElementById('themeToggle'),
            document.getElementById('themeToggleGlobal'),
            document.getElementById('themeToggleEngineer'),
            document.getElementById('themeToggleGlobalEngineer')
        ];
        btns.forEach(function(btn) {
            if (btn) btn.innerHTML = iconHtml;
        });
    }
    
    // Expose functions to global scope if needed
    window.toggleTheme = toggleTheme;
    window.updateThemeIcon = updateThemeIcon;
})();
