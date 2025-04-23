// Check authentication status and update navigation
async function updateAuthButtons() {
    const { data: { user }, error } = await supabase.auth.getUser();
    const authButtons = document.getElementById('authButtons');
    
    if (user) {
        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

        const displayName = profile?.full_name || user.email;
        
        // Update auth buttons with user menu
        authButtons.innerHTML = `
            <div class="user-menu">
                <button class="user-menu-btn">
                    <i class="fas fa-user"></i>
                    ${displayName}
                </button>
                <div class="user-menu-content">
                    <a href="profile.html">
                        <i class="fas fa-user-circle"></i>
                        Profile
                    </a>
                    <a href="profile.html#bookings">
                        <i class="fas fa-box"></i>
                        My Bookings
                    </a>
                    <a href="#" onclick="handleSignOut(); return false;">
                        <i class="fas fa-sign-out-alt"></i>
                        Sign Out
                    </a>
                </div>
            </div>
        `;

        // Add event listener for the menu button
        const menuBtn = document.querySelector('.user-menu-btn');
        const menuContent = document.querySelector('.user-menu-content');
        
        if (menuBtn && menuContent) {
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                menuContent.classList.toggle('show');
            });

            // Close menu when clicking outside
            document.addEventListener('click', () => {
                menuContent.classList.remove('show');
            });
        }

    } else {
        // User is not logged in
        authButtons.innerHTML = `
            <a href="signin.html" class="sign-in-btn">
                <i class="fas fa-user"></i>
                Sign In
            </a>
        `;
    }
}

// Handle sign out
async function handleSignOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.href = 'signin.html';
    } catch (error) {
        console.error('Error signing out:', error.message);
        alert('Error signing out: ' + error.message);
    }
}

// Initialize navigation when page loads
document.addEventListener('DOMContentLoaded', updateAuthButtons); 