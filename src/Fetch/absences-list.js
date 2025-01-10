import { Table } from '../../Component/table.js';
import { getData } from './fetch.js';

async function initAbsencesTable() {
    const user = JSON.parse(sessionStorage.getItem('utilisateur'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // Récupérer toutes les données nécessaires
        const [absences, seances, cours, professeurs, etudiants_annees, cours_annees] = await Promise.all([
            getData('absences'),
            getData('seances'),
            getData('cours'),
            getData('professeurs'),
            getData('etudiants_annees'),
            getData('cours_annees')
        ]);
        
        // Trouver l'étudiant_annee correspondant à l'utilisateur connecté
        const etudiantAnnee = etudiants_annees.find(ea => ea.etudiantId === user.id);
        
        // Filtrer les absences pour l'étudiant connecté
        const userAbsences = absences.filter(abs => abs.etudiantAnneeId === etudiantAnnee?.id);
        
        const absencesData = userAbsences.map(absence => {
            // Trouver la séance correspondante
            const seance = seances.find(s => s.id === absence.seanceId);
            
            // Trouver le cours_annee correspondant
            const coursAnnee = cours_annees.find(ca => ca.id === seance?.coursAnneeId);
            
            // Trouver le cours correspondant
            const coursInfo = cours.find(c => c.id === coursAnnee?.coursId);
            
            // Trouver le professeur correspondant via professeurAnneeId
            const professeur = professeurs.find(p => p.id === coursAnnee?.professeurAnneeId?.split('_')[0]);
            
            return {
                date: new Date(seance?.date).toLocaleDateString('fr-FR'),
                heureDebut: seance?.heureDebut || 'N/A',
                heureFin: seance?.heureFin || 'N/A',
                cours: coursInfo?.intitule || 'N/A',
                professeur: `${professeur?.prenom} ${professeur?.nom}` || 'N/A',
                justifie: absence.justifie ? 'Oui' : 'Non'
            };
        });

        const table = new Table({
            container: document.getElementById('absences-table'),
            columns: [
                { header: 'Date', key: 'date' },
                { header: 'Début', key: 'heureDebut' },
                { header: 'Fin', key: 'heureFin' },
                { header: 'Matière', key: 'cours' },
                { header: 'Justifiée', key: 'justifie' }
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