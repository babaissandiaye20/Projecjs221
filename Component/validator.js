export class Validator {
    constructor(fields) {
        this.fields = fields;
        this.errors = {};
    }

    // Méthode principale de validation
    validate(data) {
        this.errors = {};
        this.fields.forEach(field => {
            const value = data[field.name];
            this.validateField(field, value, data);
        });
        return Object.keys(this.errors).length === 0;
    }

    // Méthode pour valider un champ individuel
    validateField(field, value, allData) {
        // Validation de base des champs requis
        if (field.required && this.isEmpty(value)) {
            this.addError(field.name, `${field.label || field.name} est requis.`);
            return;
        }

        // Validations communes
        if (value) {
            if (field.minLength && !this.validateMinLength(value, field.minLength)) {
                this.addError(field.name, `${field.label} doit contenir au moins ${field.minLength} caractères.`);
            }

            if (field.maxLength && !this.validateMaxLength(value, field.maxLength)) {
                this.addError(field.name, `${field.label} ne peut pas dépasser ${field.maxLength} caractères.`);
            }

            if (field.pattern && !this.validatePattern(value, field.pattern)) {
                this.addError(field.name, `${field.label} n'est pas dans un format valide.`);
            }
        }
    }

    // Méthodes utilitaires de validation
    isEmpty(value) {
        return !value || (typeof value === 'string' && value.trim() === '');
    }

    validateMinLength(value, minLength) {
        return String(value).length >= minLength;
    }

    validateMaxLength(value, maxLength) {
        return String(value).length <= maxLength;
    }

    validatePattern(value, pattern) {
        return pattern.test(value);
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateName(name) {
        const nameRegex = /^[a-zA-ZÀ-ÿ\s-]+$/;
        return nameRegex.test(name);
    }

    // Gestion des erreurs
    addError(fieldName, message) {
        this.errors[fieldName] = message;
    }

    getErrors() {
        return this.errors;
    }

    hasErrors() {
        return Object.keys(this.errors).length > 0;
    }
}
