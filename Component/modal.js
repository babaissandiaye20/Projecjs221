// modal.js
export class Modal {
    constructor({
        title,
        content,
        onClose = () => {}
    }) {
        this.title = title;
        this.content = content;
        this.onClose = onClose;
        this.modal = null;
        this.isOpen = false;
    }

    create() {
        // Créer l'élément modal
        this.modal = document.createElement('div');
        this.modal.className = 'fixed inset-0 z-50 hidden';
        
        this.modal.innerHTML = `
            <div class="modal-overlay absolute inset-0 bg-black bg-opacity-50 opacity-0 transition-opacity duration-300">
                <div class="flex items-center justify-center min-h-screen p-4">
                    <div class="modal-content bg-white rounded-lg shadow-xl w-full max-w-md transform scale-95 transition-transform duration-300">
                        <div class="flex justify-between items-center p-6 border-b">
                            <h3 class="text-lg font-semibold text-gray-900">${this.title}</h3>
                            <button class="modal-close text-gray-400 hover:text-gray-500">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="p-6">
                            ${this.content}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Ajouter au DOM
        document.body.appendChild(this.modal);

        // Event listeners
        this.modal.querySelector('.modal-close').addEventListener('click', () => this.close());
        this.modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.close();
        });
    }

    open() {
        if (!this.modal) this.create();
        this.modal.classList.remove('hidden');
        setTimeout(() => {
            this.modal.querySelector('.modal-overlay').classList.add('opacity-100');
            this.modal.querySelector('.modal-content').classList.add('scale-100');
        }, 10);
        this.isOpen = true;
    }

    close() {
        const overlay = this.modal.querySelector('.modal-overlay');
        const content = this.modal.querySelector('.modal-content');
        
        overlay.classList.remove('opacity-100');
        content.classList.remove('scale-100');
        
        setTimeout(() => {
            this.modal.classList.add('hidden');
            this.isOpen = false;
            this.onClose();
        }, 300);
    }

    setContent(content) {
        if (this.modal) {
            this.modal.querySelector('.p-6').innerHTML = content;
        }
    }
}