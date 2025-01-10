// cours.js
import { getData } from './fetch.js';
import { Table } from '../../Component/table.js';

class Cours {
    constructor() {
        this.tableConfig = {
            columns: [
                {
                    header: 'Intitulé',
                    key: 'intitule',
                    render: (item) => item.intitule
                },
                {
                    header: 'Classes',
                    key: 'classes',
                    render: (item) => {
                        const classesForCours = this.getClassesForCours(item.id);
                        return classesForCours.map(c => c.nom).join(', ') || 'Aucune classe';
                    }
                },
                {
                    header: 'Actions',
                    key: 'actions',
                    render: (item) => `
                        <button class="view-professors px-3 py-1 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors flex items-center" 
                                data-cours-id="${item.id}">
                            <i class="fas fa-chalkboard-teacher mr-2"></i>
                            Voir professeurs
                        </button>`
                }
            ]
        };
        
        this.allCours = [];
        this.coursAnnees = [];
        this.professeurs = [];
        this.professeurAnnees = [];
        this.classes = [];
        this.classesAnnees = [];
        this.currentYear = null;
        this.professorsModal = null;
        
        this.init();
    }

    async checkUserRole() {
        const utilisateur = JSON.parse(sessionStorage.getItem('utilisateur'));
        if (!utilisateur || utilisateur.role !== 'RP') {
            throw new Error('Accès non autorisé. Seul le Responsable Pédagogique peut accéder à cette page.');
        }
        return true;
    }

    async loadAnneeFilter() {
        try {
            const annees = await getData('annees_scolaires');
            const filterSelect = document.getElementById('annee-filter');
            
            annees.sort((a, b) => new Date(b.dateDebut) - new Date(a.dateDebut));
            
            filterSelect.innerHTML = annees.map(annee => `
                <option value="${annee.id}" ${annee.isActive ? 'selected' : ''}>
                    ${annee.libelle}
                </option>
            `).join('');

            this.currentYear = annees.find(a => a.isActive)?.id || annees[0]?.id;
            filterSelect.value = this.currentYear;

            filterSelect.addEventListener('change', (e) => {
                this.currentYear = e.target.value;
                this.renderFilteredData();
            });

            return this.currentYear;
        } catch (error) {
            console.error('Erreur lors du chargement des années:', error);
            throw error;
        }
    }

    getClassesForCours(coursId) {
        const coursAnnee = this.coursAnnees.filter(ca => 
            ca.coursId === coursId && 
            ca.anneeScolaireId === this.currentYear
        );

        const classeAnneeIds = coursAnnee.map(ca => ca.classeAnneeId);
        const classeIds = this.classesAnnees
            .filter(ca => classeAnneeIds.includes(ca.id))
            .map(ca => ca.classeId);

        return this.classes.filter(classe => classeIds.includes(classe.id));
    }

    handleError(error, container) {
        console.error('Erreur:', error);
        container.innerHTML = `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p class="font-bold">Erreur</p>
                <p>${error.message}</p>
            </div>`;
    }

    async fetchData() {
        try {
            const [cours, coursAnnees, professeurs, professeurAnnees, classes, classesAnnees] = await Promise.all([
                getData('cours'),
                getData('cours_annees'),
                getData('professeurs'),
                getData('professeurs_annees'),
                getData('classes'),
                getData('classes_annees')
            ]);
            
            this.allCours = cours || [];
            this.coursAnnees = coursAnnees || [];
            this.professeurs = professeurs || [];
            this.professeurAnnees = professeurAnnees || [];
            this.classes = classes || [];
            this.classesAnnees = classesAnnees || [];
            
            return [this.allCours, this.coursAnnees, this.professeurs, this.professeurAnnees];
        } catch (error) {
            console.error('Erreur de chargement des données:', error);
            throw error;
        }
    }

    async filterCoursByYear(anneeScolaireId) {
        if (!anneeScolaireId) return [];
    
        try {
            const coursIds = [...new Set(this.coursAnnees
                .filter(ca => ca.anneeScolaireId === anneeScolaireId)
                .map(ca => ca.coursId))];
    
            return this.allCours.filter(cours => coursIds.includes(cours.id));
        } catch (error) {
            console.error('Erreur de filtrage:', error);
            return [];
        }
    }

    getProfesseursForCours(coursId) {
        try {
            const coursAnnee = this.coursAnnees.filter(ca => 
                ca.coursId === coursId && 
                ca.anneeScolaireId === this.currentYear
            );

            const profAnneeIds = coursAnnee.map(ca => ca.professeurAnneeId);
            const profIds = this.professeurAnnees
                .filter(pa => profAnneeIds.includes(pa.id))
                .map(pa => pa.professeurId);

            return this.professeurs.filter(prof => profIds.includes(prof.id));
        } catch (error) {
            console.error('Erreur lors de la récupération des professeurs:', error);
            return [];
        }
    }

    setupModal() {
        this.professorsModal = document.getElementById('professors-modal');
        if (!this.professorsModal) {
            // Créer le modal s'il n'existe pas
            const modalHTML = `
                <div id="professors-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center">
                    <div class="bg-white rounded-lg p-6 w-full max-w-4xl mx-4">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-xl font-bold text-teal-900">Liste des Professeurs</h3>
                            <button class="close-modal text-gray-500 hover:text-gray-700">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div id="professors-list" class="max-h-[70vh] overflow-y-auto">
                            <!-- La liste des professeurs sera ajoutée ici -->
                        </div>
                    </div>
                </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            this.professorsModal = document.getElementById('professors-modal');
        }
        
        // Gérer la fermeture du modal
        document.querySelector('.close-modal').addEventListener('click', () => {
            this.professorsModal.classList.add('hidden');
            this.professorsModal.classList.remove('flex');
        });

        this.professorsModal.addEventListener('click', (e) => {
            if (e.target === this.professorsModal) {
                this.professorsModal.classList.add('hidden');
                this.professorsModal.classList.remove('flex');
            }
        });
    }

    async showProfessors(coursId) {
        const professors = this.getProfesseursForCours(coursId);
        const professorsList = document.getElementById('professors-list');
        const cours = this.allCours.find(c => c.id === coursId);

        if (professors.length === 0) {
            professorsList.innerHTML = `
                <div class="text-center text-gray-500 py-4">
                    Aucun professeur assigné à ce cours
                </div>`;
        } else {
            professorsList.innerHTML = `
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white">
                        <thead>
                            <tr class="bg-gray-100">
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nom
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Prénom
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Grade
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Spécialité
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            ${professors.map(prof => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap">${prof.nom}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">${prof.prenom}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">${prof.grade}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">${prof.specialite}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>`;
        }

        this.professorsModal.classList.remove('hidden');
        this.professorsModal.classList.add('flex');
    }

    async renderFilteredData() {
        const tableContainer = document.getElementById('cours-table');
        await this.fetchData();
        
        if (!this.allCours?.length) {
            this.renderEmptyState(tableContainer);
            return;
        }

        const filteredCours = await this.filterCoursByYear(this.currentYear);
        
        if (!filteredCours?.length) {
            tableContainer.innerHTML = `
                <div class="bg-white p-4 rounded-lg shadow text-center text-gray-500">
                    Aucun cours pour cette année scolaire
                </div>`;
            return;
        }

        this.table = new Table({
            ...this.tableConfig,
            container: tableContainer,
            data: filteredCours,
            itemsPerPage: 10
        });

        this.table.render();

        // Ajouter les écouteurs d'événements pour le bouton "Voir professeurs"
        tableContainer.querySelectorAll('.view-professors').forEach(button => {
            button.addEventListener('click', () => {
                const coursId = button.dataset.coursId;
                this.showProfessors(coursId);
            });
        });
    }

    renderEmptyState(container) {
        container.innerHTML = `
            <div class="bg-white p-4 rounded-lg shadow text-center text-gray-500">
                Aucun cours disponible
            </div>`;
    }

    async init() {
        try {
            await this.checkUserRole();
            await this.loadAnneeFilter();
            this.setupModal();
            await this.fetchData();
            await this.renderFilteredData();
        } catch (error) {
            const container = document.getElementById('cours-table');
            this.handleError(error, container);
        }
    }
}

window.addEventListener('load', () => {
    new Cours();
});

export default Cours;