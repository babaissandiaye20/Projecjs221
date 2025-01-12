// coursValidator.js
import { Validator } from "../../Component/validator";

export class CoursValidator extends Validator {
    constructor() {
        const fields = [
            {
                name: 'intitule',
                label: 'Intitulé du cours',
                required: true,
                minLength: 2,
                maxLength: 100,
                pattern: /^[a-zA-ZÀ-ÿ0-9\s'-]+$/
            },
            {
                name: 'semestreId',
                label: 'Semestre',
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

    validateField(field, value, allData) {
        super.validateField(field, value, allData);

        if (field.name === 'intitule' && value) {
            if (!/^[a-zA-ZÀ-ÿ0-9\s'-]+$/.test(value)) {
                this.addError(field.name, "L'intitulé du cours ne peut contenir que des lettres, chiffres, espaces, apostrophes et tirets.");
            }
            
            if (/\s{2,}/.test(value)) {
                this.addError(field.name, "L'intitulé du cours ne peut pas contenir plusieurs espaces consécutifs.");
            }

            if (/[-']{2,}/.test(value)) {
                this.addError(field.name, "L'intitulé du cours ne peut pas contenir plusieurs tirets ou apostrophes consécutifs.");
            }
        }
    }
}

export class ProfessorAssignmentValidator extends Validator {
    constructor() {
        const fields = [
            {
                name: 'coursId',
                label: 'Cours',
                required: true
            },
            {
                name: 'professeurId',
                label: 'Professeur',
                required: true
            }
        ];
        
        super(fields);
    }

    validateField(field, value, allData) {
        super.validateField(field, value, allData);
        
        if (!value) {
            this.addError(field.name, `Le champ ${field.label} est requis.`);
        }
    }
}