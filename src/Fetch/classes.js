// classes.js
import { getData } from './fetch.js';
import { Table } from '../../Component/table.js';
import { ClasseForm } from './classe-form.js';

class Classes {
    constructor() {
        this.tableConfig = {
            columns: [
                {
                    header: 'Nom',
                    key: 'nom',
                    render: (item) => item.nom
                },
                {
                    header: 'Niveau',
                    key: 'niveau',
                    render: (item) => this.niveaux.find(n => n.id === item.niveauId)?.nom || 'Non spécifié'
                },
                {
                    header: 'Actions',
                    key: 'actions',
                    render: (item) => `
                        <button class="view-students px-3 py-1 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors flex items-center" 
                                data-classe-id="${item.id}">
                            <i class="fas fa-users mr-2"></i>
                            Voir étudiants
                        </button>`
                }
            ]
        };
        
        this.allClasses = [];
        this.classesAnnees = [];
        this.niveaux = [];
        this.currentYear = null;
        this.studentsModal = null;
        
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
            const [classes, classesAnnees, niveaux] = await Promise.all([
                getData('classes'),
                getData('classes_annees'),
                getData('niveaux')
            ]);
            
            this.allClasses = classes || [];
            this.classesAnnees = classesAnnees || [];
            this.niveaux = niveaux || [];
            
            return [this.allClasses, this.classesAnnees, this.niveaux];
        } catch (error) {
            console.error('Erreur de chargement des données:', error);
            throw error;
        }
    }

    async filterClassesByYear(anneeScolaireId) {
        if (!anneeScolaireId) return [];
    
        try {
            const classesIds = this.classesAnnees
                .filter(ca => ca.anneeScolaireId === anneeScolaireId && ca.actif === true)
                .map(ca => ca.classeId);
    
            return this.allClasses.filter(classe => classesIds.includes(classe.id));
        } catch (error) {
            console.error('Erreur de filtrage:', error);
            return [];
        }
    }
    async getStudentsForClass(classeId) {
        try {
            const [etudiantsAnnees, etudiants] = await Promise.all([
                getData('etudiants_annees'),
                getData('etudiants')
            ]);

            const classeAnnee = this.classesAnnees.find(
                ca => ca.classeId === classeId && ca.anneeScolaireId === this.currentYear
            );

            if (!classeAnnee) return [];

            const etudiantIds = etudiantsAnnees
                .filter(ea => ea.classeAnneeId === classeAnnee.id)
                .map(ea => ea.etudiantId);

            return etudiants.filter(etudiant => etudiantIds.includes(etudiant.id));
        } catch (error) {
            console.error('Erreur lors de la récupération des étudiants:', error);
            return [];
        }
    }

    setupModal() {
        this.studentsModal = document.getElementById('students-modal');
        
        // Fermeture du modal
        document.querySelector('.close-modal').addEventListener('click', () => {
            this.studentsModal.classList.add('hidden');
            this.studentsModal.classList.remove('flex');
        });

        // Fermeture en cliquant en dehors du modal
        this.studentsModal.addEventListener('click', (e) => {
            if (e.target === this.studentsModal) {
                this.studentsModal.classList.add('hidden');
                this.studentsModal.classList.remove('flex');
            }
        });
    }

    async showStudents(classeId) {
        const students = await this.getStudentsForClass(classeId);
        const studentsList = document.getElementById('students-list');
        const classe = this.allClasses.find(c => c.id === classeId);

        if (students.length === 0) {
            studentsList.innerHTML = `
                <div class="text-center text-gray-500 py-4">
                    Aucun étudiant inscrit dans cette classe
                </div>`;
        } else {
            studentsList.innerHTML = `
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white">
                        <thead>
                            <tr class="bg-gray-100">
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Photo
                            </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Matricule
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nom Complet
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Adresse
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            ${students.map(student => `
                                <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap"><img class="h-16 rounded-full"src="${student.photo}"></td>
                                    <td class="px-6 py-4 whitespace-nowrap">${student.matricule}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">${student.nomComplet}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">${student.adress}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>`;
        }

        this.studentsModal.classList.remove('hidden');
        this.studentsModal.classList.add('flex');
    }

    async renderFilteredData() {
        const tableContainer = document.getElementById('classes-table');
        await this.fetchData();
        
        if (!this.allClasses?.length) {
            this.renderEmptyState(tableContainer);
            return;
        }

        const filteredClasses = await this.filterClassesByYear(this.currentYear);
        
        if (!filteredClasses?.length) {
            tableContainer.innerHTML = `
                <div class="bg-white p-4 rounded-lg shadow text-center text-gray-500">
                    Aucune classe pour cette année scolaire
                </div>`;
            return;
        }

        this.table = new Table({
            ...this.tableConfig,
            container: tableContainer,
            data: filteredClasses,
            itemsPerPage: 10
        });

        this.table.render();

        // Ajouter les écouteurs d'événements pour le bouton "Voir étudiants"
        tableContainer.querySelectorAll('.view-students').forEach(button => {
            button.addEventListener('click', () => {
                const classeId = button.dataset.classeId;
                this.showStudents(classeId);
            });
        });
    }

    renderEmptyState(container) {
        container.innerHTML = `
            <div class="bg-white p-4 rounded-lg shadow text-center text-gray-500">
                Aucune classe disponible
            </div>`;
    }

    async init() {
        try {
            await this.checkUserRole();
            new ClasseForm();
            await this.loadAnneeFilter();
            this.setupModal();
            await this.fetchData();
            this.renderFilteredData();
        } catch (error) {
            const container = document.getElementById('classes-table');
            this.handleError(error, container);
        }
    }
}

window.addEventListener('load', () => {
    new Classes();
});

export default Classes;