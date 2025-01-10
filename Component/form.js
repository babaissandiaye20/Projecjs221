// form.js
class TableForm {
    constructor(options) {
        this.container = options.container;
        this.onSubmit = options.onSubmit;
        this.fields = options.fields || [];
    }

    createFormHTML() {
        return `
            <div class="bg-teal-900 rounded-lg p-6 mb-4">
                <form id="table-form" class="space-y-4">
                    ${this.fields.map(field => `
                        <div class="flex flex-col">
                            <label class="text-white mb-1">${field.label}</label>
                            <input 
                                type="${field.type || 'text'}"
                                name="${field.name}"
                                placeholder="${field.placeholder || ''}"
                                class="p-2 rounded-lg bg-teal-800 text-white border border-teal-700 
                                focus:outline-none focus:border-teal-500"
                                ${field.required ? 'required' : ''}
                            >
                        </div>
                    `).join('')}
                    <div class="flex justify-end">
                        <button 
                            type="submit"
                            class="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-500"
                        >
                            Ajouter
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    bindEvents() {
        const form = this.container.querySelector('#table-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            if (this.onSubmit) {
                this.onSubmit(data);
            }
            
            form.reset();
        });
    }

    render() {
        this.container.innerHTML = this.createFormHTML();
        this.bindEvents();
    }
}

export { TableForm };