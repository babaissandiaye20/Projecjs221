

const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
const logoContainer = document.getElementById('logo-container');
const menuTexts = document.querySelectorAll('.menu-text');
let isMenuCollapsed = false;

menuToggle.addEventListener('click', () => {
    isMenuCollapsed = !isMenuCollapsed;
    if (window.innerWidth >= 640) {
        if (isMenuCollapsed) {
            sidebar.classList.remove('sm:w-64');
            sidebar.classList.add('sm:w-20');
            logoContainer.classList.remove('sm:w-32', 'sm:h-32');
            logoContainer.classList.add('sm:w-12', 'sm:h-12');
            menuTexts.forEach(text => text.classList.add('hidden'));
        } else {
            sidebar.classList.remove('sm:w-20');
            sidebar.classList.add('sm:w-64');
            logoContainer.classList.remove('sm:w-12', 'sm:h-12');
            logoContainer.classList.add('sm:w-32', 'sm:h-32');
            menuTexts.forEach(text => text.classList.remove('hidden'));
        }
    } else {
        sidebar.classList.toggle('hidden');
    }
});

window.addEventListener('resize', () => {
    if (window.innerWidth >= 640) {
        sidebar.classList.remove('hidden');
    }
    
});
const profileToggle = document.getElementById('profile-toggle');
const profileMenu = document.getElementById('profile-menu');

profileToggle.addEventListener('click', () => {
    profileMenu.classList.toggle('hidden');
});

// Fermer le menu si on clique en dehors
document.addEventListener('click', (event) => {
    if (!profileToggle.contains(event.target) && !profileMenu.contains(event.target)) {
        profileMenu.classList.add('hidden');
    }
});
// Mettre ce code au début de main.js
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si l'utilisateur est connecté
    const utilisateur = sessionStorage.getItem('utilisateur');
    if (!utilisateur) {
        window.location.replace('login.html');
        return;
    }
    
    // Initialiser l'interface utilisateur
    updateUserInterface();
});
