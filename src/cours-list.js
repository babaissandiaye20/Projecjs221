// cours-list.js
async function fetchStudentCourses() {
    try {
        const utilisateur = JSON.parse(sessionStorage.getItem('utilisateur'));
        if (!utilisateur) {
            throw new Error('Aucun utilisateur connecté');
        }

        const etudiantResponse = await fetch(`http://localhost:3000/etudiants?login=${utilisateur.login}`);
        const etudiant = await etudiantResponse.json();
        if (!etudiant || etudiant.length === 0) {
            throw new Error('Étudiant non trouvé');
        }

        const coursResponse = await fetch(`http://localhost:3000/cours?classeId=${etudiant[0].classeId}`);
        const cours = await coursResponse.json();

        const coursComplets = await Promise.all(cours.map(async (cours) => {
            const profResponse = await fetch(`http://localhost:3000/professeurs/${cours.professeurId}`);
            const professeur = await profResponse.json();
            
            const seancesResponse = await fetch(`http://localhost:3000/seances?coursId=${cours.id}`);
            const seances = await seancesResponse.json();

            return {
                ...cours,
                professeur,
                seances
            };
        }));

        return coursComplets;
    } catch (error) {
        console.error('Erreur lors de la récupération des cours:', error);
        throw error;
    }
}

// Configuration de la pagination
const ITEMS_PER_PAGE = 5; // Nombre d'éléments par page

// Fonction pour gérer la pagination
function paginate(array, page_size, page_number) {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
}

// Création du modal pour les sessions
function createSessionModal() {
    const modalContainer = document.createElement('div');
    modalContainer.id = 'sessionModal';
    modalContainer.className = 'fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50';
    
    modalContainer.innerHTML = `
        <div class="bg-teal-900 rounded-lg p-6 w-full max-w-2xl mx-4">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center space-x-2">
                    <img src="/api/placeholder/32/32" alt="Session icon" class="w-8 h-8">
                    <h2 class="text-white text-xl font-bold">SESSION COURS</h2>
                </div>
                <button id="closeModal" class="text-white hover:text-gray-300">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            <h3 id="modalCoursTitle" class="text-white text-lg mb-6">Cours: </h3>
            <div id="sessionsContainer" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <!-- Les sessions seront injectées ici -->
            </div>
        </div>
    `;

    document.body.appendChild(modalContainer);

    // Gestionnaire pour fermer le modal
    const closeBtn = modalContainer.querySelector('#closeModal');
    const modal = document.getElementById('sessionModal');

    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Fermer le modal en cliquant en dehors
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
}

// Fonction pour afficher les sessions d'un cours
function showSessions(cours) {
    const modal = document.getElementById('sessionModal');
    const sessionsContainer = modal.querySelector('#sessionsContainer');
    const modalCoursTitle = modal.querySelector('#modalCoursTitle');
    
    modalCoursTitle.textContent = `Cours: ${cours.professeur.specialite}`;
    sessionsContainer.innerHTML = '';
    
    const seancesTriees = [...cours.seances].sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.heureDebut);
        const dateB = new Date(b.date + 'T' + b.heureDebut);
        return dateA - dateB;
    });

    seancesTriees.forEach(seance => {
        const date = new Date(seance.date).toLocaleDateString('fr-FR');
        const debut = seance.heureDebut.substring(0, 5);
        const fin = seance.heureFin.substring(0, 5);

        const sessionCard = document.createElement('div');
        sessionCard.className = 'bg-slate-200/20 rounded-lg p-4 text-white';
        sessionCard.innerHTML = `
            <div class="text-center">
                <div class="font-bold mb-2">${date}</div>
                <div class="text-sm">${debut} - ${fin}</div>
            </div>
        `;
        sessionsContainer.appendChild(sessionCard);
    });

    modal.classList.remove('hidden');
}

// Fonction pour mettre à jour la pagination
function updatePagination(currentPage, totalPages) {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = `
        <button class="bg-slate-200/20 p-2 rounded-lg hover:bg-slate-200/30 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}" 
                ${currentPage === 1 ? 'disabled' : ''} 
                data-action="prev">
            <i class="fas fa-chevron-left text-white"></i>
        </button>
        <span class="text-white">${currentPage}-${totalPages}</span>
        <button class="bg-slate-200/20 p-2 rounded-lg hover:bg-slate-200/30 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}" 
                ${currentPage === totalPages ? 'disabled' : ''} 
                data-action="next">
            <i class="fas fa-chevron-right text-white"></i>
        </button>
    `;
}

function renderCoursesTable(cours, currentPage = 1) {
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = '';

    const totalPages = Math.ceil(cours.length / ITEMS_PER_PAGE);
    const paginatedCours = paginate(cours, ITEMS_PER_PAGE, currentPage);

    paginatedCours.forEach(cours => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-4">${new Date(cours.dateCours).toLocaleDateString('fr-FR')}</td>
            <td class="p-4">${cours.professeur.specialite}</td>
            <td class="p-4">${cours.seances.reduce((total, seance) => {
                const debut = new Date(`2000-01-01T${seance.heureDebut}`);
                const fin = new Date(`2000-01-01T${seance.heureFin}`);
                return total + (fin - debut) / (1000 * 60 * 60);
            }, 0)}</td>
            <td class="p-4">
                <i class="fas fa-copy cursor-pointer hover:text-gray-300" data-cours-id="${cours.id}"></i>
            </td>
            <td class="p-4">
                <i class="fas fa-ellipsis-v cursor-pointer hover:text-gray-300" data-cours-id="${cours.id}"></i>
            </td>
        `;
        tbody.appendChild(row);

        // Ajouter l'écouteur d'événements pour l'icône de copie
        const copyIcon = row.querySelector('.fa-copy');
        copyIcon.addEventListener('click', () => showSessions(cours));
    });

    updatePagination(currentPage, totalPages);

    // Gestionnaires d'événements pour la pagination
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button || button.disabled) return;

        if (button.dataset.action === 'prev') {
            currentPage > 1 && renderCoursesTable(cours, currentPage - 1);
        } else if (button.dataset.action === 'next') {
            currentPage < totalPages && renderCoursesTable(cours, currentPage + 1);
        }
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    try {
        createSessionModal();
        const cours = await fetchStudentCourses();
        
        // Ajouter le conteneur de pagination s'il n'existe pas déjà
        if (!document.querySelector('.pagination')) {
            const paginationDiv = document.createElement('div');
            paginationDiv.className = 'pagination p-4 flex justify-center items-center space-x-4';
            document.querySelector('.bg-teal-900').appendChild(paginationDiv);
        }
        
        renderCoursesTable(cours);
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
    }
});

export { fetchStudentCourses, renderCoursesTable };