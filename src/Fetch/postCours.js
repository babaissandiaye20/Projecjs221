    // Gestion du modal
    const modal = document.getElementById('add-modal');
    const cours_button = document.getElementById('add-cours-btn');
    const cours_form = document.getElementById('cours-form');

    // Ouvrir le modal
    cours_button.addEventListener('click', () => {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    });
    
    // Fermer le modal
    function closeModal() {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        cours_form.reset(); 
    }
    
    // Gestion de la soumission du formulaire
    cours_form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const courseData = {
            id: formData.get('coursId'),
            intitule: formData.get('intitule')
        };
    
        // Validation de l'ID du cours
        const idPattern = /^CR\d{3}$/;
        if (!idPattern.test(courseData.id)) {
            alert("L'ID du cours doit être au format CR suivi de 3 chiffres (ex: CR001)");
            return;
        }
    
        // Vérifier si l'ID existe déjà
        if (cours.some(c => c.id === courseData.id)) {
            alert("Cet ID de cours existe déjà");
            return;
        }
    
        // Ajouter le nouveau cours
        cours.push(courseData);
        console.log('Nouveau cours ajouté:', courseData);
        console.log('Liste mise à jour des cours:', cours);
    
        // Feedback et fermeture
        alert('Cours ajouté avec succès !');
        closeModal();
    });
    
    // Fermer le modal en cliquant en dehors
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
    
    // Empêcher la propagation du clic depuis le formulaire
    modal.querySelector('.bg-white').addEventListener('click', function(e) {
        e.stopPropagation();
    });