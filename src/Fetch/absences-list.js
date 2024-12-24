import { Table } from '../../Component/table.js';
import { getData } from './fetch.js';

async function initAbsencesTable() {
    const user = JSON.parse(sessionStorage.getItem('utilisateur'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const [absences, seances, cours, professeurs] = await Promise.all([
            getData('absences'),
            getData('seances'),
            getData('cours'),
            getData('professeurs')
        ]);
        
        const userAbsences = absences.filter(abs => abs.etudiantId === user.id);
        
        const absencesData = userAbsences.map(absence => {
            const seance = seances.find(s => s.id === absence.seanceId);
            const coursInfo = cours.find(c => c.id === seance.coursId);
            const professeur = professeurs.find(p => p.id === coursInfo.professeurId);
            
            return {
                date: new Date(absence.dateAbs).toLocaleDateString(),
                heureDebut: seance.heureDebut,
                heureFin: seance.heureFin,
                cours: professeur?.specialite || 'Non spécifié'
            };
        });

        const table = new Table({
            container: document.getElementById('absences-table'),
            columns: [
                { header: 'Date', key: 'date' },
                { header: 'Début', key: 'heureDebut' },
                { header: 'Fin', key: 'heureFin' },
                { header: 'Matière', key: 'cours' }
            ],
            data: absencesData,
            itemsPerPage: 5
        });

        table.render();
    } catch (error) {
        console.error('Erreur lors du chargement des absences:', error);
    }
}

document.addEventListener('DOMContentLoaded', initAbsencesTable);