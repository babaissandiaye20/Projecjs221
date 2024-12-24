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
        container.querySelector('.pagination-prev').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.onPageChange(this.currentPage);
                this.render(container);
            }
        });

        container.querySelector('.pagination-next').addEventListener('click', () => {
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
        this.currentPage = Math.min(this.currentPage, this.totalPages);
    }
}
export {Pagination  };