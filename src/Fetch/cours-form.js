import { Modal } from '../../Component/modal.js';
import { getData, postData } from './fetch.js';

class CoursForm {
    constructor() {
        this.currentYear = null;
        this.modal = null;
        this.professorModal = null;
        this.init();
     
    }

    async init() {
        try {
            const annees = await getData('annees_scolaires');
            this.currentYear = annees.find(a => a.isActive)?.id;
            await this.setupModal();
            await this.setupProfessorModal();
            this.addButtons();
        } catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
        }
    }

    addButtons() {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'flex justify-between items-center mb-4';

        const addCoursButton = document.createElement('button');
        addCoursButton.className = 'bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-500';
        addCoursButton.textContent = 'Ajouter un cours';
        addCoursButton.onclick = () => this.modal.open();

        const addProfessorButton = document.createElement('button');
        addProfessorButton.className = 'bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-500';
        addProfessorButton.textContent = 'Assigner un professeur à un cours';
        addProfessorButton.onclick = () => this.professorModal.open();

        buttonContainer.appendChild(addCoursButton);
        buttonContainer.appendChild(addProfessorButton);

        const container = document.getElementById('cours-table');
        container.parentNode.insertBefore(buttonContainer, container);
    }

    async setupModal() {
        const formContainer = document.createElement('div');
        formContainer.id = 'cours-form-container';

        formContainer.innerHTML = `
            <form id="cours-form" class="space-y-4">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700">Intitulé du cours</label>
                    <input type="text" name="intitule" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500">
                </div>

                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700">Semestre</label>
                    <select name="semestreId" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500">
                        <option value="">Sélectionnez un semestre</option>
                    </select>
                </div>

                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700">Classe</label>
                    <select name="classeId" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500">
                        <option value="">Sélectionnez une classe</option>
                    </select>
                </div>

                <div class="flex justify-end">
                    <button type="submit" class="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-500">
                        Enregistrer
                    </button>
                </div>
            </form>
        `;

        this.modal = new Modal({
            title: 'Ajouter un nouveau cours',
            content: formContainer.outerHTML
        });

        this.modal.create();
        await this.initializeForm();
    }

    async setupProfessorModal() {
        const formContainer = document.createElement('div');
        formContainer.id = 'professor-form-container';

        formContainer.innerHTML = `
            <form id="professor-form" class="space-y-4">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700">Cours</label>
                    <select name="coursId" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500">
                        <option value="">Sélectionnez un cours</option>
                    </select>
                </div>
                
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700">Professeur</label>
                    <select name="professeurId" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500">
                        <option value="">Sélectionnez un professeur</option>
                    </select>
                </div>

                <div id="warning-message" class="hidden mb-4 p-4 bg-yellow-100 text-yellow-700 rounded-lg"></div>

                <div class="flex justify-end">
                    <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500">
                        Enregistrer
                    </button>
                </div>
            </form>
        `;

        this.professorModal = new Modal({
            title: 'Assigner un professeur à un cours',
            content: formContainer.outerHTML
        });

        this.professorModal.create();
        await this.initializeProfessorForm();
    }

    async initializeForm() {
        const [semestres, classes, classesAnnees] = await Promise.all([
            getData('semestres'),
            getData('classes'),
            getData('classes_annees')
        ]);

        const activeClassesAnnees = classesAnnees.filter(ca => 
            ca.anneeScolaireId === this.currentYear && ca.actif
        );

        const semestreSelect = this.modal.modal.querySelector('select[name="semestreId"]');
        const classeSelect = this.modal.modal.querySelector('select[name="classeId"]');

        semestres.forEach(semestre => {
            const option = document.createElement('option');
            option.value = semestre.id;
            option.textContent = semestre.nom;
            semestreSelect.appendChild(option);
        });

        // Filtrer les classes actives pour l'année en cours
        const activeClasses = classes.filter(c => 
            activeClassesAnnees.some(ca => ca.classeId === c.id)
        );

        activeClasses.forEach(classe => {
            const option = document.createElement('option');
            option.value = classe.id;
            option.textContent = classe.nom;
            classeSelect.appendChild(option);
        });

        const form = this.modal.modal.querySelector('#cours-form');
        form.onsubmit = async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = {
                intitule: formData.get('intitule'),
                semestreId: formData.get('semestreId'),
                classeId: formData.get('classeId')
            };

            try {
                const cours = await getData('cours');
                let maxId = 0;
                cours.forEach(c => {
                    const idNum = parseInt(c.id.replace('CR', ''));
                    if (idNum > maxId) maxId = idNum;
                });
                const newId = `CR${String(maxId + 1).padStart(3, '0')}`;

                const coursData = {
                    id: newId,
                    intitule: data.intitule
                };

                await postData('cours', coursData);

                // Créer l'entrée dans cours_annees
                const coursAnnees = await getData('cours_annees');
                let maxCaId = 0;
                coursAnnees.forEach(ca => {
                    const idNum = parseInt(ca.id.replace('CRA', ''));
                    if (idNum > maxCaId) maxCaId = idNum;
                });
                const newCaId = `CRA${String(maxCaId + 1).padStart(3, '0')}`;

                const classeAnnee = classesAnnees.find(ca => 
                    ca.classeId === data.classeId && 
                    ca.anneeScolaireId === this.currentYear
                );

                const coursAnneeData = {
                    id: newCaId,
                    coursId: newId,
                    classeAnneeId: classeAnnee.id,
                    anneeScolaireId: this.currentYear,
                    semestreId: data.semestreId,
                    actif: true
                };

                await postData('cours_annees', coursAnneeData);

                this.modal.close();
                window.location.reload();
            } catch (error) {
                console.error('Erreur lors de l\'ajout du cours:', error);
                alert('Une erreur est survenue lors de l\'ajout du cours');
            }
        };
    }

    async initializeProfessorForm() {
        const [cours, coursAnnees, professeurs, professeursAnnees] = await Promise.all([
            getData('cours'),
            getData('cours_annees'),
            getData('professeurs'),
            getData('professeurs_annees')
        ]);

        // Récupérer les cours actifs pour l'année en cours
        const activeCoursAnnees = coursAnnees.filter(ca => 
            ca.anneeScolaireId === this.currentYear && ca.actif
        );
        const activeCours = cours.filter(c => 
            activeCoursAnnees.some(ca => ca.coursId === c.id)
        );

        // Récupérer les professeurs actifs pour l'année en cours
        const activeProfesseursAnnees = professeursAnnees.filter(pa => 
            pa.anneeScolaireId === this.currentYear && pa.actif
        );
        const activeProfesseurs = professeurs.filter(p => 
            activeProfesseursAnnees.some(pa => pa.professeurId === p.id)
        );

        const coursSelect = this.professorModal.modal.querySelector('select[name="coursId"]');
        const professeurSelect = this.professorModal.modal.querySelector('select[name="professeurId"]');

        activeCours.forEach(cours => {
            const option = document.createElement('option');
            option.value = cours.id;
            option.textContent = cours.intitule;
            coursSelect.appendChild(option);
        });

        activeProfesseurs.forEach(professeur => {
            const option = document.createElement('option');
            option.value = professeur.id;
            option.textContent = `${professeur.prenom} ${professeur.nom}`;
            professeurSelect.appendChild(option);
        });

        const form = this.professorModal.modal.querySelector('#professor-form');
        form.onsubmit = async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const coursId = formData.get('coursId');
            const professeurId = formData.get('professeurId');

            try {
                const coursAnnee = coursAnnees.find(ca => 
                    ca.coursId === coursId && 
                    ca.anneeScolaireId === this.currentYear
                );

                const professeurAnnee = professeursAnnees.find(pa => 
                    pa.professeurId === professeurId && 
                    pa.anneeScolaireId === this.currentYear
                );

                // Mettre à jour le cours_annee avec le professeur
                const updatedCoursAnnee = {
                    ...coursAnnee,
                    professeurAnneeId: professeurAnnee.id
                };

                await postData('cours_annees', updatedCoursAnnee);
                
                this.professorModal.close();
                window.location.reload();
            } catch (error) {
                console.error('Erreur lors de l\'assignation du professeur:', error);
                alert('Une erreur est survenue lors de l\'assignation du professeur au cours');
            }
        };
    }
}

export { CoursForm };