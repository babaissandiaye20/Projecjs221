// professeur-form.js
import { TableForm } from '../../Component/form.js';
import { Modal } from '../../Component/modal.js';
import { getData, postData } from './fetch.js';

class ProfesseurForm {
    constructor() {
        this.currentYear = null;
        this.modal = null;
        this.form = null;
        this.init();
    }

    async init() {
        try {
            const annees = await this.getCurrentYear();
            this.setupModal();
            this.addOpenButton();
        } catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
        }
    }

    async getCurrentYear() {
        const annees = await getData('annees_scolaires');
        this.currentYear = annees.find(a => a.isActive)?.id;
        return this.currentYear;
    }

    addOpenButton() {
        const button = document.createElement('button');
        button.className = 'bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-500 mb-4';
        button.textContent = 'Ajouter un professeur';
        button.onclick = () => this.modal.open();

        const tableContainer = document.getElementById('professeurs-table');
        tableContainer.parentNode.insertBefore(button, tableContainer);
    }

    setupModal() {
        const formContainer = document.createElement('div');
        formContainer.id = 'professeur-form-container';

        this.modal = new Modal({
            title: 'Ajouter un nouveau professeur',
            content: formContainer.outerHTML,
            onClose: () => {
                if (this.form) {
                    const formElement = document.querySelector('#table-form');
                    if (formElement) formElement.reset();
                }
            }
        });

        this.modal.create();
        this.setupForm(formContainer.id);
    }

    async generateProfesseurId() {
        try {
            const professeurs = await getData('professeurs');
            let maxId = 0;
            professeurs.forEach(prof => {
                const idNum = parseInt(prof.id.replace('P', ''));
                if (idNum > maxId) maxId = idNum;
            });
            return `P${String(maxId + 1).padStart(3, '0')}`;
        } catch (error) {
            console.error('Erreur lors de la génération de l\'ID:', error);
            throw error;
        }
    }

    async generateProfesseurAnneeId() {
        try {
            const professeursAnnees = await getData('professeurs_annees');
            let maxId = 0;
            professeursAnnees.forEach(pa => {
                const idNum = parseInt(pa.id.replace('PA', ''));
                if (idNum > maxId) maxId = idNum;
            });
            return `PA${String(maxId + 1).padStart(3, '0')}`;
        } catch (error) {
            console.error('Erreur lors de la génération de l\'ID professeur_annee:', error);
            throw error;
        }
    }

    setupForm(containerId) {
        this.form = new TableForm({
            container: this.modal.modal.querySelector(`#${containerId}`),
            fields: [
                {
                    label: 'Nom',
                    name: 'nom',
                    required: true,
                    placeholder: 'Entrez le nom du professeur'
                },
                {
                    label: 'Prénom',
                    name: 'prenom',
                    required: true,
                    placeholder: 'Entrez le prénom du professeur'
                },
                {
                    label: 'Grade',
                    name: 'grade',
                    required: true,
                    placeholder: 'Ex: Professeur, Maître de conférences...'
                },
                {
                    label: 'Spécialité',
                    name: 'specialite',
                    required: true,
                    placeholder: 'Ex: Java, PHP, Python...'
                },
                {
                    label: 'Email',
                    name: 'email',
                    type: 'email',
                    required: true,
                    placeholder: 'exemple@ecole.com'
                }
            ],
            onSubmit: async (data) => {
                try {
                    const newProfId = await this.generateProfesseurId();
                    const newProfAnneeId = await this.generateProfesseurAnneeId();

                    const professeurData = {
                        id: newProfId,
                        ...data,
                        login: data.email,
                        mdp: 'passer123',
                        role: 'PROF'
                    };

                    await postData('professeurs', professeurData);

                    if (this.currentYear) {
                        const profAnneeData = {
                            id: newProfAnneeId,
                            professeurId: newProfId,
                            anneeScolaireId: this.currentYear,
                            actif: true
                        };
                        await postData('professeurs_annees', profAnneeData);
                    }

                    this.modal.close();
                    window.location.reload();
                } catch (error) {
                    console.error('Erreur lors de l\'ajout du professeur:', error);
                    alert('Une erreur est survenue lors de l\'ajout du professeur');
                }
            }
        });

        this.form.render();
    }
}

export { ProfesseurForm };