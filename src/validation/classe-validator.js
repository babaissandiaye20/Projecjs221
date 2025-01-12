import { Validator } from "../../Component/validator";

class ClasseValidator extends Validator {
    constructor() {
        // Définition des champs à valider pour les deux formulaires
        const fields = [
            {
                name: 'nom',
                label: 'Nom de la classe',
                required: true,
                minLength: 2,
                maxLength: 50,
                pattern: /^[a-zA-Z0-9À-ÿ\s-]+$/
            },
            {
                name: 'niveauId',
                label: 'Niveau',
                required: true
            },
            {
                name: 'etudiantId',
                label: 'Étudiant',
                required: true
            },
            {
                name: 'classeId',
                label: 'Classe',
                required: true
            }
        ];
        
        super(fields);
    }

    // Surcharge de la méthode validate pour ajouter des validations spécifiques
    validate(data) {
        // Appel de la méthode validate du parent
        const isBaseValid = super.validate(data);
        
        // Validations spécifiques pour le formulaire de classe
        if (data.nom) {
            // Vérifie si le nom de la classe commence par un caractère valide
            if (!/^[a-zA-Z0-9À-ÿ]/.test(data.nom)) {
                this.addError('nom', 'Le nom de la classe doit commencer par une lettre ou un chiffre');
            }
            
            // Vérifie les caractères spéciaux non autorisés
            if (/[^a-zA-Z0-9À-ÿ\s-]/.test(data.nom)) {
                this.addError('nom', 'Le nom de la classe ne peut contenir que des lettres, chiffres, espaces et tirets');
            }
        }

        // Validations spécifiques pour le formulaire d'ajout d'étudiant
        if (data.etudiantId && data.classeId) {
            // Validation supplémentaire si nécessaire pour la combinaison étudiant/classe
            this.validateStudentClassCombination(data.etudiantId, data.classeId);
        }

        return !this.hasErrors();
    }

    // Méthode pour valider la combinaison étudiant/classe
    async validateStudentClassCombination(etudiantId, classeId) {
        try {
            // Récupération des données nécessaires
            const etudiantsAnnees = await getData('etudiants_annees');
            const classesAnnees = await getData('classes_annees');
            
            // Vérification si l'étudiant est déjà dans une classe pour l'année en cours
            const existingEnrollment = etudiantsAnnees.find(ea => 
                ea.etudiantId === etudiantId && 
                ea.anneeScolaireId === this.currentYear
            );

            if (existingEnrollment) {
                // On ajoute un avertissement plutôt qu'une erreur car c'est permis mais nécessite confirmation
                this.addError('warning', 'L\'étudiant est déjà inscrit dans une classe pour cette année');
            }
        } catch (error) {
            console.error('Erreur lors de la validation étudiant/classe:', error);
            this.addError('system', 'Une erreur est survenue lors de la validation');
        }
    }

    // Méthode utilitaire pour valider un identifiant
    validateId(id, prefix) {
        const pattern = new RegExp(`^${prefix}\\d{3}$`);
        return pattern.test(id);
    }
}

export { ClasseValidator };