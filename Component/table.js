// table.js
// table.js
class Table {
    constructor(options) {
        this.columns = options.columns;
        this.data = options.data || [];
        this.container = options.container;
        this.itemsPerPage = options.itemsPerPage || 5;
        this.currentPage = 1;
        this.onCopyClick = options.onCopyClick;
        this.onActionClick = options.onActionClick;

        this.pagination = new Pagination({
            itemsPerPage: this.itemsPerPage,
            totalItems: this.data.length,
            onPageChange: (page) => {
                this.currentPage = page;
                this.render();
            }
        });
    }

    getCurrentPageItems() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.data.slice(startIndex, endIndex);
    }

    createTableHTML() {
        return `
            <div class="bg-teal-900 rounded-lg overflow-hidden">
                <table class="w-full">
                    <thead class="bg-teal-800 text-white">
                        <tr>
                            ${this.columns.map(col => `
                                <th class="p-4 text-left">${col.header}</th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody class="text-white divide-y divide-teal-800">
                        ${this.getCurrentPageItems().map(item => `
                            <tr>
                                ${this.columns.map(col => `
                                    <td class="p-4">
                                        ${col.render ? col.render(item) : item[col.key]}
                                    </td>
                                `).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div id="pagination-container" class="p-4"></div>
            </div>
        `;
    }

    bindEvents() {
        this.container.addEventListener('click', (e) => {
            const icon = e.target.closest('[data-cours-id]');
            if (!icon) return;

            // The issue was here - course IDs in your data are strings, not integers
            const coursId = icon.dataset.coursId;
            const action = icon.dataset.action;
            const course = this.data.find(c => c.id === coursId);

            if (!course) {
                console.error('Course not found:', coursId, 'Available courses:', this.data);
                return;
            }

            if (action === 'copy' && this.onCopyClick) {
                this.onCopyClick(course);
            } else if (action === 'menu' && this.onActionClick) {
                this.onActionClick(course);
            }
        });
    }
    render() {
        console.log('Rendering table with data:', this.data);
        this.container.innerHTML = this.createTableHTML();
        const paginationContainer = this.container.querySelector('#pagination-container');
        this.pagination.render(paginationContainer);
        this.bindEvents();
    }

    updateData(newData) {
        this.data = newData;
        this.pagination.updateTotalItems(newData.length);
        this.render();
    }
}

class Pagination {
    constructor(options) {
        this.itemsPerPage = options.itemsPerPage;
        this.totalItems = options.totalItems;
        this.currentPage = 1;
        this.onPageChange = options.onPageChange;
    }

    get totalPages() {
        return Math.ceil(this.totalItems / this.itemsPerPage);
    }

    createPaginationHTML() {
        return `
            <div class="flex justify-center items-center space-x-4">
                <button class="pagination-prev bg-slate-200/20 p-2 rounded-lg hover:bg-slate-200/30 
                    ${this.currentPage === 1 ? 'opacity-50' : ''}">
                    <i class="fas fa-chevron-left text-white"></i>
                </button>
                <span class="text-white">${this.currentPage}-${this.totalPages}</span>
                <button class="pagination-next bg-slate-200/20 p-2 rounded-lg hover:bg-slate-200/30 
                    ${this.currentPage === this.totalPages ? 'opacity-50' : ''}">
                    <i class="fas fa-chevron-right text-white"></i>
                </button>
            </div>
        `;
    }

    bindEvents(container) {
        const prevButton = container.querySelector('.pagination-prev');
        const nextButton = container.querySelector('.pagination-next');

        prevButton.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.onPageChange(this.currentPage);
                this.render(container);
            }
        });

        nextButton.addEventListener('click', () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.onPageChange(this.currentPage);
                this.render(container);
            }
        });
    }

    render(container) {
        container.innerHTML = this.createPaginationHTML();
        this.bindEvents(container);
    }

    updateTotalItems(newTotal) {
        this.totalItems = newTotal;
        if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages;
        }
    }
}

export { Table, Pagination };