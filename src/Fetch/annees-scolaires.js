// annees-scolaires.js
import { getData, postData, patchData } from './fetch.js';
import { Table } from '../../Component/table.js';

class AnneesScolaires {
    constructor() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    async initialize() {
        try {
            if (!this.checkRequiredElements()) {
                console.error('Éléments DOM requis non trouvés');
                return;
            }

            this.setupTableConfig();
            await this.checkUserRole();
            this.bindTableEvents();
            await this.fetchAndRenderData();
            this.isMenuCollapsed = false;
            this.handleWindowResize();
        } catch (error) {
            this.handleError(error);
        }
    }

    checkRequiredElements() {
        this.tableContainer = document.getElementById('annees-table');
        return Boolean(this.tableContainer);
    }

    setupTableConfig() {
        this.tableConfig = {
            columns: [
                { 
                    header: 'Année Scolaire',
                    key: 'libelle',
                    render: (item) => item.libelle || 'Non spécifié'
                },
                {
                    header: 'Date Début',
                    key: 'dateDebut',
                    render: (item) => new Date(item.dateDebut).toLocaleDateString('fr-FR')
                },
                {
                    header: 'Date Fin',
                    key: 'dateFin',
                    render: (item) => new Date(item.dateFin).toLocaleDateString('fr-FR')
                },
                {
                    header: 'État',
                    key: 'isActive',
                    render: (item) => `
                        <div class="flex items-center">
                            <span class="px-3 py-1 rounded-full ${item.isActive ? 'bg-green-500' : 'bg-gray-500'} text-white text-sm">
                                ${item.isActive ? 'Actif' : 'Inactif'}
                            </span>
                        </div>`
                },
                {
                    header: 'Actions',
                    key: 'actions',
                    render: (item) => `
                        <div class="flex items-center space-x-2">
                            ${!item.isActive ? `
                                <button class="activate-btn px-3 py-1 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors flex items-center" 
                                        data-annee-id="${item.id}">
                                    <i class="fas fa-check-circle mr-2"></i>
                                    Activer
                                </button>
                            ` : ''}
                        </div>`
                }
            ]
        };
    }

    handleWindowResize() {
        // Géré par main.js
    }

    bindTableEvents() {
        this.tableContainer.addEventListener('click', (e) => {
            const activateBtn = e.target.closest('.activate-btn');
            if (activateBtn) {
                const anneeId = activateBtn.dataset.anneeId;
                if (anneeId) {
                    this.activateAnnee(anneeId);
                }
            }
        });
    }

    async checkUserRole() {
        const utilisateur = JSON.parse(sessionStorage.getItem('utilisateur'));
        if (!utilisateur) {
            window.location.href = 'login.html';
            return false;
        }
        if (utilisateur.role !== 'RP') {
            throw new Error('Accès non autorisé. Seul le Responsable Pédagogique peut accéder à cette page.');
        }
        return true;
    }

    async activateAnnee(id) {
        try {
            // Vérifier si l'année est déjà active
            const anneeActuelle = await getData(`annees_scolaires/${id}`);
            if (anneeActuelle.isActive) {
                alert('Cette année est déjà active');
                return;
            }
    
            // 1. Mettre à jour uniquement le champ isActive des années scolaires
            const annees = await getData('annees_scolaires');
            const updateAnneesPromises = annees.map(annee => 
                patchData(`annees_scolaires/${annee.id}`, {
                    isActive: annee.id === id
                })
            );
    
            // 2. Mettre à jour uniquement le champ actif des professeurs_annees
            const professeursAnnees = await getData('professeurs_annees');
            const updateProfesseursAnneesPromises = professeursAnnees.map(profAnnee => 
                patchData(`professeurs_annees/${profAnnee.id}`, {
                    actif: profAnnee.anneeScolaireId === id
                })
            );
    
            // 3. Mettre à jour le champ actif des classes_annees
            const classesAnnees = await getData('classes_annees');
            const updateClassesAnneesPromises = classesAnnees.map(classAnnee => 
                patchData(`classes_annees/${classAnnee.id}`, {
                    actif: classAnnee.anneeScolaireId === id
                })
            );
    
            // 4. Mettre à jour le champ actif des cours_annees
            const coursAnnees = await getData('cours_annees');
            const updateCoursAnneesPromises = coursAnnees.map(coursAnnee => 
                patchData(`cours_annees/${coursAnnee.id}`, {
                    actif: coursAnnee.anneeScolaireId === id
                })
            );
    
            // Exécuter toutes les mises à jour
            await Promise.all([
                ...updateAnneesPromises,
                ...updateProfesseursAnneesPromises,
                ...updateClassesAnneesPromises,
                ...updateCoursAnneesPromises
            ]);
    
            await this.fetchAndRenderData();
            alert('Année scolaire activée avec succès');
        } catch (error) {
            console.error('Erreur lors de l\'activation:', error);
            alert('Erreur lors de l\'activation: ' + error.message);
            this.handleError(error);
        }
    }
    async fetchAndRenderData() {
        try {
            const annees = await getData('annees_scolaires');
            
            if (!annees?.length) {
                this.renderEmptyState();
                return;
            }

            this.table = new Table({
                ...this.tableConfig,
                container: this.tableContainer,
                data: annees,
                itemsPerPage: 5
            });

            this.table.render();
        } catch (error) {
            this.handleError(error);
        }
    }

    renderEmptyState() {
        this.tableContainer.innerHTML = `
            <div class="bg-white p-4 rounded-lg shadow text-center text-gray-500">
                Aucune année scolaire disponible
            </div>`;
    }

    handleError(error) {
        console.error('Erreur:', error);
        if (this.tableContainer) {
            this.tableContainer.innerHTML = `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p class="font-bold">Erreur</p>
                    <p>${error.message}</p>
                </div>`;
        }
    }
}

const anneeScolaire = new AnneesScolaires();
export default anneeScolaire;