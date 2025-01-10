const BASE_URL = 'http://localhost:3000';

// Fonction générique GET
async function getData(endpoint) {
    try {
        const response = await fetch(`${BASE_URL}/${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

// Fonction générique POST
async function postData(endpoint, data) {
    try {
        const response = await fetch(`${BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error posting data:', error);
        throw error;
    }
}

// Fonction PATCH modifiée pour préserver les données existantes
async function patchData(endpoint, updateData) {
    try {
        // 1. D'abord, récupérer les données existantes
        const existingData = await getData(endpoint);
        
        // 2. Créer un nouvel objet qui combine les données existantes avec les mises à jour
        const mergedData = {
            ...existingData,
            ...updateData
        };
        
        // 3. Effectuer la requête PATCH
        const response = await fetch(`${BASE_URL}/${endpoint}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mergedData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error updating data:', error);
        throw error;
    }
}

export { getData, postData, patchData };