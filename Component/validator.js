export class Validator {
    constructor(fields) {
        this.fields = fields;
        this.errors = {};
    }

    validate(data) {
        this.errors = {};
        this.fields.forEach(field => {
            const value = data[field.name];
            if (field.required && (!value || value.trim() === '')) {
                this.errors[field.name] = `${field.label || field.name} est requis.`;
            }
        });
        return Object.keys(this.errors).length === 0;
    }

    getErrors() {
        return this.errors;
    }
}
