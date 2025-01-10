// professeurs.js
import { getData } from './fetch.js';
import { Table } from '../../Component/table.js';

class Professeurs {
    constructor() {
        this.tableConfig = {
            columns: [
                {
                    header: 'Nom',
                    key: 'nom',
                    render: (item) => `${item.nom} ${item.prenom}`
                },
                {
                    header: 'Grade',
                    key: 'grade',
                    render: (item) => item.grade
                },
                {
                    header: 'Spécialité',
                    key: 'specialite',
                    render: (item) => item.specialite
                },
                {
                    header: 'Email',
                    key: 'email',
                    render: (item) => item.email
                }
            ]
        };
        
        this.allProfesseurs = [];
        this.professeursAnnees = [];
        this.currentYear = null;
        
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
            
            // Trier les années par date de début décroissante
            annees.sort((a, b) => new Date(b.dateDebut) - new Date(a.dateDebut));
            
            filterSelect.innerHTML = annees.map(annee => `
                <option value="${annee.id}" ${annee.isActive ? 'selected' : ''}>
                    ${annee.libelle}
                </option>
            `).join('');

            // Sélectionner l'année active ou la première année
            this.currentYear = annees.find(a => a.isActive)?.id || annees[0]?.id;
            filterSelect.value = this.currentYear;

            // Ajouter un log pour le débogage
            console.log('Année courante:', this.currentYear);
            console.log('Années disponibles:', annees);

            filterSelect.addEventListener('change', (e) => {
                this.currentYear = e.target.value;
                console.log('Changement d\'année:', this.currentYear);
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
            // Forcer le rechargement des données
            this.allProfesseurs = await getData('professeurs');
            this.professeursAnnees = await getData('professeurs_annees');
            
            // Vérifier que nous avons des tableaux
            if (!Array.isArray(this.allProfesseurs)) this.allProfesseurs = [];
            if (!Array.isArray(this.professeursAnnees)) this.professeursAnnees = [];
    
            return [this.allProfesseurs, this.professeursAnnees];
        } catch (error) {
            console.error('Erreur de chargement des données:', error);
            throw error;
        }
    }

    async filterProfesseursByYear(anneeScolaireId) {
        if (!anneeScolaireId) return [];
    
        try {
            const [professeurs, professeursAnnees] = await Promise.all([
                getData('professeurs'),
                getData('professeurs_annees')
            ]);
    
            console.log('Année recherchée:', anneeScolaireId);
            console.log('Professeurs disponibles:', professeurs);
            console.log('Affectations professeurs:', professeursAnnees);
    
            const profsIds = professeursAnnees
                .filter(pa => pa.anneeScolaireId === anneeScolaireId && pa.actif === true)
                .map(pa => pa.professeurId);
    
            console.log('IDs des professeurs filtrés:', profsIds);
    
            const result = professeurs.filter(prof => profsIds.includes(prof.id));
            console.log('Résultat final:', result);
    
            return result;
        } catch (error) {
            console.error('Erreur de filtrage:', error);
            return [];
        }
    }
  
    // Supprimer la première version de filterProfesseursByYear et garder celle avec le filtre actif
// Supprimer la première version de renderFilteredData et modifier la deuxième comme suit:

async renderFilteredData() {
    const tableContainer = document.getElementById('professeurs-table');
    await this.fetchData();
    
    if (!this.allProfesseurs?.length) {
        this.renderEmptyState(tableContainer);
        return;
    }

    // Attendre que la promesse soit résolue avec await
    const filteredProfesseurs = await this.filterProfesseursByYear(this.currentYear);
    
    if (!filteredProfesseurs?.length) {
        this.renderNoProfsForYear(tableContainer);
        return;
    }

    this.table = new Table({
        ...this.tableConfig,
        container: tableContainer,
        data: filteredProfesseurs,
        itemsPerPage: 10
    });

    this.table.render();
}

// Et ajouter la méthode renderEmptyState qui manque
renderEmptyState(container) {
    container.innerHTML = `
        <div class="bg-white p-4 rounded-lg shadow text-center text-gray-500">
            Aucun professeur disponible
        </div>`;
}

    async init() {
        try {
            await this.checkUserRole();
            await this.loadAnneeFilter();
            await this.fetchData();
            this.renderFilteredData();
        } catch (error) {
            const container = document.getElementById('professeurs-table');
            container.innerHTML = `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p class="font-bold">Erreur</p>
                    <p>${error.message}</p>
                </div>`;
        }
    }
}

window.addEventListener('load', () => {
    new Professeurs();
});

export default Professeurs;