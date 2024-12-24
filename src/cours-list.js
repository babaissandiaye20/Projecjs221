// cours-list.js
import { getData } from './Fetch/fetch.js';
import { Table } from '../Component/table.js';

class SessionModal {
    constructor() {
        this.modal = null;
        this.createModal();
        this.modal = document.getElementById('sessionModal'); // Set modal after creation
        this.bindEvents();
    }

    createModal() {
        // First check if modal already exists
        const existingModal = document.getElementById('sessionModal');
        if (existingModal) {
            existingModal.remove(); // Remove existing modal to prevent duplicates
        }

        const modalHTML = `
            <div id="sessionModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
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
                    <div id="sessionsContainer" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    bindEvents() {
        if (!this.modal) {
            console.error('Modal element not found');
            return;
        }

        const closeButton = this.modal.querySelector('#closeModal');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.hide());
        }

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });
    }

    // Rest of the methods remain the same...
    show(cours) {
        if (!this.modal) {
            console.error('Modal element not found');
            return;
        }

        const sessionsContainer = this.modal.querySelector('#sessionsContainer');
        const modalCoursTitle = this.modal.querySelector('#modalCoursTitle');
        
        if (!sessionsContainer || !modalCoursTitle) {
            console.error('Required modal elements not found');
            return;
        }

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

        this.modal.classList.remove('hidden');
        this.modal.classList.add('flex');
    }

    hide() {
        if (!this.modal) {
            console.error('Modal element not found');
            return;
        }
        this.modal.classList.add('hidden');
        this.modal.classList.remove('flex');
    }
}
class CoursesList {
    constructor() {
        this.sessionModal = new SessionModal();
        this.tableConfig = {
            columns: [
                { 
                    header: 'Date',
                    key: 'dateCours',
                    render: (item) => new Date(item.dateCours).toLocaleDateString('fr-FR')
                },
                {
                    header: 'Libellé',
                    key: 'professeur',
                    render: (item) => item.professeur?.specialite || 'Non spécifié'
                },
                {
                    header: "Nombre d'heure(H)",
                    key: 'seances',
                    render: (item) => this.calculateTotalHours(item.seances || []).toFixed(1)
                },
                {
                    header: 'Sessions',
                    key: 'sessions',
                    render: (item) => `<i class="fas fa-copy cursor-pointer hover:text-gray-300" data-cours-id="${item.id}" data-action="copy"></i>`
                },
                {
                    header: 'Actions',
                    key: 'actions',
                    render: (item) => `<i class="fas fa-ellipsis-v cursor-pointer hover:text-gray-300" data-cours-id="${item.id}" data-action="menu"></i>`
                }
            ]
        };
    }

    calculateTotalHours(seances) {
        if (!Array.isArray(seances)) return 0;
        
        return seances.reduce((total, seance) => {
            try {
                const debut = new Date(`2000-01-01T${seance.heureDebut}`);
                const fin = new Date(`2000-01-01T${seance.heureFin}`);
                if (isNaN(debut.getTime()) || isNaN(fin.getTime())) {
                    console.warn('Invalid time format for seance:', seance);
                    return total;
                }
                return total + (fin - debut) / (1000 * 60 * 60);
            } catch (error) {
                console.warn('Error calculating hours for seance:', seance, error);
                return total;
            }
        }, 0);
    }

    async fetchStudentCourses() {
        try {
            const utilisateur = JSON.parse(sessionStorage.getItem('utilisateur'));
            if (!utilisateur?.login) {
                throw new Error('Aucun utilisateur connecté');
            }

            const etudiants = await getData(`etudiants?login=${utilisateur.login}`);
            if (!etudiants?.[0]?.classeId) {
                throw new Error('Étudiant non trouvé ou classe non définie');
            }

            const cours = await getData(`cours?classeId=${etudiants[0].classeId}`);
            if (!Array.isArray(cours)) {
                throw new Error('Format de données de cours invalide');
            }

            const coursComplets = await Promise.all(cours.map(async (cours) => {
                try {
                    const professeur = await getData(`professeurs/${cours.professeurId}`);
                    const seances = await getData(`seances?coursId=${cours.id}`);
                    return { 
                        ...cours, 
                        professeur: professeur || { specialite: 'Non spécifié' },
                        seances: Array.isArray(seances) ? seances : []
                    };
                } catch (error) {
                    console.error(`Erreur lors de la récupération des détails du cours ${cours.id}:`, error);
                    return { ...cours, professeur: { specialite: 'Non spécifié' }, seances: [] };
                }
            }));

            return coursComplets;
        } catch (error) {
            console.error('Erreur lors de la récupération des cours:', error);
            throw error;
        }
    }


    async init() {
        try {
            console.log('Début de l\'initialisation');
            const tableContainer = document.getElementById('courses-table');
            console.log('Container trouvé:', tableContainer);
            
            const courses = await this.fetchStudentCourses();
            console.log('Cours récupérés pour le rendu:', courses);
            
            if (!courses || courses.length === 0) {
                console.log('Aucun cours à afficher');
                tableContainer.innerHTML = '<div class="text-center p-4">Aucun cours disponible</div>';
                return;
            }
            
            this.table = new Table({
                ...this.tableConfig,
                container: tableContainer,
                data: courses,
                itemsPerPage: 5,
                onCopyClick: (cours) => this.sessionModal.show(cours)
            });
            
            console.log('Table initialisée, début du rendu');
            this.table.render();
            console.log('Rendu terminé');
        } catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
            const tableContainer = document.getElementById('courses-table');
            if (tableContainer) {
                tableContainer.innerHTML = `<div class="text-center p-4 text-red-500">Erreur: ${error.message}</div>`;
            }
        }
    }
}
// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    const coursesList = new CoursesList();
    coursesList.init();
});

export default CoursesList;