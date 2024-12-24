class SessionModal {
    constructor() {
        this.modal = null;
        this.createModal();
        this.modal = document.getElementById('sessionModal');
        this.bindEvents();
    }

    createModal() {
        document.getElementById('sessionModal')?.remove();

        const modalHTML = `
            <div id="sessionModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
                <div class="bg-teal-900 rounded-lg p-6 w-full max-w-2xl mx-4">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center space-x-2">
                            <img src="/api/placeholder/32/32" alt="Session icon" class="w-8 h-8">
                            <h2 class="text-white text-xl font-bold">SESSION COURS</h2>
                        </div>
                        <button id="closeModal" class="text-white hover:text-gray-300">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <h3 id="modalCoursTitle" class="text-white text-lg mb-6">Cours: </h3>
                    <div id="sessionsContainer" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    bindEvents() {
        if (!this.modal) return;
        
        const closeButton = this.modal.querySelector('#closeModal');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.hide());
        }

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.hide();
        });
    }

    show(cours) {
        if (!this.modal) return;

        const sessionsContainer = this.modal.querySelector('#sessionsContainer');
        const modalCoursTitle = this.modal.querySelector('#modalCoursTitle');
        
        if (!sessionsContainer || !modalCoursTitle) return;

        modalCoursTitle.textContent = `Cours: ${cours.professeur.specialite}`;
        sessionsContainer.innerHTML = '';
        
        const seancesTriees = [...cours.seances].sort((a, b) => {
            return new Date(a.date + 'T' + a.heureDebut) - new Date(b.date + 'T' + b.heureDebut);
        });

        seancesTriees.forEach(seance => {
            const date = new Date(seance.date).toLocaleDateString('fr-FR');
            const debut = seance.heureDebut.substring(0, 5);
            const fin = seance.heureFin.substring(0, 5);

            const sessionCard = document.createElement('div');
            sessionCard.className = 'bg-slate-200/20 rounded-lg p-4 text-white';
            sessionCard.innerHTML = `
                <div class="text-center">
                    <div class="font-bold mb-2">${date}</div>
                    <div class="text-sm">${debut} - ${fin}</div>
                </div>
            `;
            sessionsContainer.appendChild(sessionCard);
        });

        this.modal.classList.remove('hidden');
        this.modal.classList.add('flex');
    }

    hide() {
        if (!this.modal) return;
        this.modal.classList.add('hidden');
        this.modal.classList.remove('flex');
    }
}

export {SessionModal };