// cours-list.js
import { getData } from './Fetch/fetch.js';
import { Table } from '../Component/table.js';

class SessionModal {
    constructor() {
        this.modal = null;
        this.init();
    }

    init() {
        const modalHTML = `
            <div id="sessionModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center">
                <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 transform transition-all">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-gray-900">Sessions du cours</h3>
                        <button class="modal-close text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="sessions-list space-y-4 max-h-[60vh] overflow-y-auto"></div>
                </div>
            </div>`;

        const existingModal = document.getElementById('sessionModal');
        if (existingModal) {
            existingModal.remove();
        }

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('sessionModal');
        this.bindEvents();
    }

    bindEvents() {
        this.modal.querySelector('.modal-close').addEventListener('click', () => this.hide());
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
                this.hide();
            }
        });
    }

    show(cours) {
        if (!cours || !cours.seances) return;

        const sessionsList = this.modal.querySelector('.sessions-list');
        sessionsList.innerHTML = cours.seances.length > 0 ? 
            cours.seances.map(seance => `
                <div class="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-gray-600">Date:</p>
                            <p class="font-medium">${new Date(seance.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">Horaires:</p>
                            <p class="font-medium">${seance.heureDebut} - ${seance.heureFin}</p>
                        </div>
                    </div>
                </div>
            `).join('') :
            '<div class="text-center text-gray-500 py-4">Aucune session disponible pour ce cours</div>';

        this.modal.classList.remove('hidden');
    }

    hide() {
        this.modal.classList.add('hidden');
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
                    render: (item) => new Date(item.date).toLocaleDateString('fr-FR')
                },
                {
                    header: 'Cours',
                    key: 'intitule',
                    render: (item) => item.intitule || 'Non spécifié'
                },
                {
                    header: 'Professeur',
                    key: 'professeur',
                    render: (item) => `${item.professeur?.nom || ''} ${item.professeur?.prenom || ''} - ${item.professeur?.specialite || 'Non spécifié'}`
                },
                {
                    header: "Nombre d'heures",
                    key: 'seances',
                    render: (item) => this.calculateTotalHours(item.seances || []).toFixed(1)
                },
                {
                    header: 'Sessions',
                    key: 'sessions',
                    render: (item) => `
                        <button 
                            class="show-sessions-btn px-3 py-1 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors" 
                            data-course='${JSON.stringify(item).replace(/'/g, "&apos;")}'
                        >
                            <i class="fas fa-calendar-alt mr-2"></i>Voir
                        </button>`
                }
            ]
        };
        this.bindEvents();
    }

    bindEvents() {
        // Use event delegation for session buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.show-sessions-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const button = e.target.closest('.show-sessions-btn');
                const courseData = JSON.parse(button.dataset.course.replace(/&apos;/g, "'"));
                this.sessionModal.show(courseData);
            }
        });
    }

    calculateTotalHours(seances) {
        if (!Array.isArray(seances)) return 0;
        
        return seances.reduce((total, seance) => {
            try {
                const debut = new Date(`2000-01-01T${seance.heureDebut}`);
                const fin = new Date(`2000-01-01T${seance.heureFin}`);
                if (isNaN(debut.getTime()) || isNaN(fin.getTime())) {
                    console.warn('Format d\'heure invalide pour la séance:', seance);
                    return total;
                }
                return total + (fin - debut) / (1000 * 60 * 60);
            } catch (error) {
                console.warn('Erreur lors du calcul des heures pour la séance:', seance, error);
                return total;
            }
        }, 0);
    }

    async fetchStudentCourses() {
        try {
            const utilisateur = JSON.parse(sessionStorage.getItem('utilisateur'));
            if (!utilisateur?.login) throw new Error('Aucun utilisateur connecté');

            const etudiants = await getData(`etudiants?login=${utilisateur.login}`);
            if (!etudiants?.[0]) throw new Error('Étudiant non trouvé');

            const etudiantAnnees = await getData(`etudiants_annees?etudiantId=${etudiants[0].id}`);
            if (!etudiantAnnees?.[0]) throw new Error('Aucune inscription trouvée');

            const coursAnnees = await getData(`cours_annees?classeAnneeId=${etudiantAnnees[0].classeAnneeId}`);
            
            const coursComplets = await Promise.all(coursAnnees.map(async (coursAnnee) => {
                const [cours, professeurAnnee, seances] = await Promise.all([
                    getData(`cours/${coursAnnee.coursId}`),
                    getData(`professeurs_annees/${coursAnnee.professeurAnneeId}`),
                    getData(`seances?coursAnneeId=${coursAnnee.id}`)
                ]);

                const professeur = await getData(`professeurs/${professeurAnnee.professeurId}`);

                return {
                    ...coursAnnee,
                    ...cours,
                    date: coursAnnee.dateDebut || new Date().toISOString(),
                    professeur,
                    seances: seances || []
                };
            }));

            return coursComplets;
        } catch (error) {
            console.error('Erreur:', error);
            throw error;
        }
    }

    async init() {
        try {
            const tableContainer = document.getElementById('courses-table');
            const courses = await this.fetchStudentCourses();

            if (!courses?.length) {
                tableContainer.innerHTML = '<div class="text-center p-4">Aucun cours disponible</div>';
                return;
            }

            this.table = new Table({
                ...this.tableConfig,
                container: tableContainer,
                data: courses,
                itemsPerPage: 5
            });

            this.table.render();
        } catch (error) {
            const tableContainer = document.getElementById('courses-table');
            tableContainer.innerHTML = `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p class="font-bold">Erreur</p>
                    <p>${error.message}</p>
                </div>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const coursesList = new CoursesList();
    coursesList.init();
});

export default CoursesList;