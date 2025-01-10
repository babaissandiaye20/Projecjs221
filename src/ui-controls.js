// shared/ui-controls.js

// Configuration globale pour les animations
const ANIMATION_DURATION = 300; // en millisecondes

// Gestion de la sidebar
export function initializeSidebar() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const logoContainer = document.getElementById('logo-container');
    const menuTexts = document.querySelectorAll('.menu-text');
    let isMenuCollapsed = false;

    if (!menuToggle || !sidebar || !logoContainer) {
        console.error('Éléments de la sidebar non trouvés');
        return;
    }

    // Animation de la sidebar
    function animateSidebar(collapse) {
        sidebar.style.transition = `width ${ANIMATION_DURATION}ms ease`;
        logoContainer.style.transition = `all ${ANIMATION_DURATION}ms ease`;
        menuTexts.forEach(text => {
            text.style.transition = `opacity ${ANIMATION_DURATION}ms ease`;
        });

        if (window.innerWidth >= 640) { // Version desktop
            if (collapse) {
                sidebar.classList.remove('sm:w-64');
                sidebar.classList.add('sm:w-20');
                logoContainer.classList.remove('sm:w-32', 'sm:h-32');
                logoContainer.classList.add('sm:w-12', 'sm:h-12');
                menuTexts.forEach(text => {
                    text.style.opacity = '0';
                    setTimeout(() => text.classList.add('hidden'), ANIMATION_DURATION);
                });
            } else {
                sidebar.classList.remove('sm:w-20');
                sidebar.classList.add('sm:w-64');
                logoContainer.classList.remove('sm:w-12', 'sm:h-12');
                logoContainer.classList.add('sm:w-32', 'sm:h-32');
                menuTexts.forEach(text => {
                    text.classList.remove('hidden');
                    setTimeout(() => text.style.opacity = '1', 10);
                });
            }
        } else { // Version mobile
            sidebar.style.transition = `transform ${ANIMATION_DURATION}ms ease`;
            sidebar.style.transform = collapse ? 'translateX(-100%)' : 'translateX(0)';
        }
    }

    menuToggle.addEventListener('click', () => {
        isMenuCollapsed = !isMenuCollapsed;
        animateSidebar(isMenuCollapsed);
    });

    // Gestion du redimensionnement
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 640) {
            sidebar.style.transform = '';
            if (isMenuCollapsed) {
                animateSidebar(true);
            } else {
                animateSidebar(false);
            }
        }
    });
}

// Gestion du menu profil
export function initializeProfileMenu() {
    const profileToggle = document.getElementById('profile-toggle');
    const profileMenu = document.getElementById('profile-menu');

    if (!profileToggle || !profileMenu) {
        console.error('Éléments du menu profil non trouvés');
        return;
    }

    // Animation du menu profil
    function toggleProfileMenu(show) {
        profileMenu.style.transition = `all ${ANIMATION_DURATION}ms ease`;
        profileMenu.style.opacity = show ? '0' : '1';
        profileMenu.style.transform = show ? 'scale(0.95)' : 'scale(1)';

        if (show) {
            profileMenu.classList.remove('hidden');
            setTimeout(() => {
                profileMenu.style.opacity = '1';
                profileMenu.style.transform = 'scale(1)';
            }, 10);
        } else {
            setTimeout(() => {
                profileMenu.classList.add('hidden');
            }, ANIMATION_DURATION);
        }
    }

    profileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = profileMenu.classList.contains('hidden');
        toggleProfileMenu(isHidden);
    });

    // Fermer le menu en cliquant en dehors
    document.addEventListener('click', (event) => {
        if (!profileToggle.contains(event.target) && !profileMenu.contains(event.target)) {
            toggleProfileMenu(false);
        }
    });
}