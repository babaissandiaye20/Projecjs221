// classe-form.js
import { TableForm } from '../../Component/form.js';
import { Modal } from '../../Component/modal.js';
import { getData, postData } from './fetch.js';

class ClasseForm {
    constructor() {
        this.currentYear = null;
        this.modal = null;
        this.studentModal = null;
        this.form = null;
        this.init();
    }

    async init() {
        try {
            const annees = await getData('annees_scolaires');
            this.currentYear = annees.find(a => a.isActive)?.id;
            await this.setupModal();
            await this.setupStudentModal();
            this.addButtons();
        } catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
        }
    }

    addButtons() {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'flex gap-4 mb-4';

        const addClasseButton = document.createElement('button');
        addClasseButton.className = 'bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-500';
        addClasseButton.textContent = 'Ajouter une classe';
        addClasseButton.onclick = () => this.modal.open();

        const addStudentButton = document.createElement('button');
        addStudentButton.className = 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500';
        addStudentButton.textContent = 'Ajouter un étudiant à une classe';
        addStudentButton.onclick = () => this.studentModal.open();

        buttonContainer.appendChild(addClasseButton);
        buttonContainer.appendChild(addStudentButton);

        const container = document.getElementById('classes-table');
        container.parentNode.insertBefore(buttonContainer, container);
    }

    async setupModal() {
        const formContainer = document.createElement('div');
        formContainer.id = 'classe-form-container';

        formContainer.innerHTML = `
            <form id="classe-form" class="space-y-4">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700">Nom de la classe</label>
                    <input type="text" name="nom" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500">
                </div>
                
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700">Niveau</label>
                    <select name="niveauId" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500">
                        <option value="">Sélectionnez un niveau</option>
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
            title: 'Ajouter une nouvelle classe',
            content: formContainer.outerHTML
        });

        this.modal.create();
        await this.initializeForm();
    }

    async setupStudentModal() {
        const formContainer = document.createElement('div');
        formContainer.id = 'student-form-container';

        formContainer.innerHTML = `
            <form id="student-form" class="space-y-4">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700">Étudiant</label>
                    <select name="etudiantId" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500">
                        <option value="">Sélectionnez un étudiant</option>
                    </select>
                </div>
                
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700">Classe</label>
                    <select name="classeId" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500">
                        <option value="">Sélectionnez une classe</option>
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

        this.studentModal = new Modal({
            title: 'Ajouter un étudiant à une classe',
            content: formContainer.outerHTML
        });

        this.studentModal.create();
        await this.initializeStudentForm();
    }

    async initializeForm() {
        const niveaux = await getData('niveaux');
        
        const select = this.modal.modal.querySelector('select[name="niveauId"]');
        niveaux.forEach(niveau => {
            const option = document.createElement('option');
            option.value = niveau.id;
            option.textContent = niveau.nom;
            select.appendChild(option);
        });

        const form = this.modal.modal.querySelector('#classe-form');
        form.onsubmit = async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = {
                nom: formData.get('nom'),
                niveauId: formData.get('niveauId')
            };

            try {
                const classes = await getData('classes');
                let maxId = 0;
                classes.forEach(classe => {
                    const idNum = parseInt(classe.id.replace('C', ''));
                    if (idNum > maxId) maxId = idNum;
                });
                const newId = `C${String(maxId + 1).padStart(3, '0')}`;

                const classeData = {
                    id: newId,
                    nom: data.nom,
                    niveauId: data.niveauId
                };

                await postData('classes', classeData);

                if (this.currentYear) {
                    const classesAnnees = await getData('classes_annees');
                    let maxCaId = 0;
                    classesAnnees.forEach(ca => {
                        const idNum = parseInt(ca.id.replace('CA', ''));
                        if (idNum > maxCaId) maxCaId = idNum;
                    });
                    const newCaId = `CA${String(maxCaId + 1).padStart(3, '0')}`;

                    const classeAnneeData = {
                        id: newCaId,
                        classeId: newId,
                        anneeScolaireId: this.currentYear,
                        actif: true
                    };

                    await postData('classes_annees', classeAnneeData);
                }

                this.modal.close();
                window.location.reload();
            } catch (error) {
                console.error('Erreur lors de l\'ajout de la classe:', error);
                alert('Une erreur est survenue lors de l\'ajout de la classe');
            }
        };
    }

    async initializeStudentForm() {
        // Récupérer toutes les données nécessaires
        const [etudiants, classes, classesAnnees, etudiantsAnnees] = await Promise.all([
            getData('etudiants'),
            getData('classes'),
            getData('classes_annees'),
            getData('etudiants_annees')
        ]);

        // Récupérer les classes actives pour l'année en cours
        const activeClassesAnnees = classesAnnees.filter(ca => 
            ca.anneeScolaireId === this.currentYear && ca.actif
        );
        const activeClasses = classes.filter(c => 
            activeClassesAnnees.some(ca => ca.classeId === c.id)
        );

        // Remplir les selects
        const etudiantSelect = this.studentModal.modal.querySelector('select[name="etudiantId"]');
        const classeSelect = this.studentModal.modal.querySelector('select[name="classeId"]');
        const warningDiv = this.studentModal.modal.querySelector('#warning-message');

        etudiants.forEach(etudiant => {
            const option = document.createElement('option');
            option.value = etudiant.id;
            option.textContent = etudiant.nomComplet;
            etudiantSelect.appendChild(option);
        });

        activeClasses.forEach(classe => {
            const option = document.createElement('option');
            option.value = classe.id;
            option.textContent = classe.nom;
            classeSelect.appendChild(option);
        });

        // Gérer le changement d'étudiant
        etudiantSelect.onchange = async (e) => {
            const etudiantId = e.target.value;
            const etudiantAnnee = etudiantsAnnees.find(ea => 
                ea.etudiantId === etudiantId && 
                ea.anneeScolaireId === this.currentYear
            );

            if (etudiantAnnee) {
                const classeAnnee = classesAnnees.find(ca => ca.id === etudiantAnnee.classeAnneeId);
                const classe = classes.find(c => c.id === classeAnnee.classeId);
                warningDiv.textContent = `Attention: Cet étudiant est déjà dans la classe ${classe.nom}. Voulez-vous le changer de classe ?`;
                warningDiv.className = 'mb-4 p-4 bg-yellow-100 text-yellow-700 rounded-lg';
            } else {
                warningDiv.className = 'hidden';
            }
        };

        // Gérer la soumission du formulaire
        const form = this.studentModal.modal.querySelector('#student-form');
        form.onsubmit = async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const etudiantId = formData.get('etudiantId');
            const classeId = formData.get('classeId');

            try {
                const etudiantAnnee = etudiantsAnnees.find(ea => 
                    ea.etudiantId === etudiantId && 
                    ea.anneeScolaireId === this.currentYear
                );

                // Générer un nouvel ID pour etudiant_annee
                let maxEaId = 0;
                etudiantsAnnees.forEach(ea => {
                    const idNum = parseInt(ea.id.replace('EA', ''));
                    if (idNum > maxEaId) maxEaId = idNum;
                });
                const newEaId = `EA${String(maxEaId + 1).padStart(3, '0')}`;

                const classeAnnee = classesAnnees.find(ca => 
                    ca.classeId === classeId && 
                    ca.anneeScolaireId === this.currentYear
                );

                // Si l'étudiant est déjà dans une classe, demander confirmation
                if (etudiantAnnee) {
                    if (!confirm('Voulez-vous vraiment changer cet étudiant de classe ?')) {
                        return;
                    }
                }

                const etudiantAnneeData = {
                    id: newEaId,
                    etudiantId: etudiantId,
                    classeAnneeId: classeAnnee.id,
                    anneeScolaireId: this.currentYear
                };

                await postData('etudiants_annees', etudiantAnneeData);
                this.studentModal.close();
                window.location.reload();
            } catch (error) {
                console.error('Erreur lors de l\'ajout de l\'étudiant:', error);
                alert('Une erreur est survenue lors de l\'ajout de l\'étudiant');
            }
        };
    }
}

export { ClasseForm };