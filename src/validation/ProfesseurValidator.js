import { Validator } from "../../Component/validator";
export class ProfesseurValidator extends Validator {
    constructor(fields) {
        super(fields);
        this.professeurs = [];
        this.gradesValides = [
            'Professeur',
            'Maître de conférences',
            'Assistant',
            'Vacataire',
            'TD'
        ];
        // Message d'erreur personnalisé pour l'email
        this.emailMessage = "L'email doit contenir un '@' et un nom de domaine valide (exemple: nom@domaine.com)";
    }

    // Méthode pour initialiser les données de validation
    async setProfesseurs(professeurs) {
        this.professeurs = professeurs;
    }

    // Surcharge de la méthode validateField pour ajouter des validations spécifiques
    validateField(field, value, allData) {
        // Appel des validations de base
        super.validateField(field, value, allData);

        // Si le champ a déjà une erreur, ne pas continuer
        if (this.errors[field.name]) return;

        // Validations spécifiques aux professeurs
        switch (field.name) {
            case 'email':
                if (value && !this.validateEmail(value)) {
                    this.addError(field.name, this.emailMessage);
                }
                if (value && this.isEmailDuplicate(value)) {
                    this.addError(field.name, "Cette adresse email est déjà utilisée par un autre professeur.");
                }
                break;

            case 'nom':
            case 'prenom':
                if (value && !this.validateName(value)) {
                    this.addError(field.name, `Le ${field.label} ne doit contenir que des lettres, espaces et tirets.`);
                }
                break;

            case 'grade':
                if (value && !this.validateGrade(value)) {
                    this.addError(field.name, `Le grade doit être l'un des suivants: ${this.gradesValides.join(', ')}`);
                }
                break;

            case 'specialite':
                if (value && value.length < 2) {
                    this.addError(field.name, "La spécialité doit contenir au moins 2 caractères.");
                }
                break;
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateGrade(grade) {
        return this.gradesValides.includes(grade);
    }

    validateName(name) {
        const nameRegex = /^[a-zA-ZÀ-ÿ\s-]+$/;
        return nameRegex.test(name);
    }

    isEmailDuplicate(email) {
        return this.professeurs.some(prof => 
            prof.email.toLowerCase() === email.toLowerCase()
        );
    }
}