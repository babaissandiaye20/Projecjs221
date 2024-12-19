import { getData } from './src/Fetch/fetch.js';

async function loadCourses() {
    try {
        const courses = await getData('courses');
        const tableBody = document.querySelector('tbody');
        tableBody.innerHTML = courses.map(course => `
            <tr>
                <td class="p-4">${course.date}</td>
                <td class="p-4">${course.libelle}</td>
                <td class="p-4">${course.hours}</td>
                <td class="p-4">
                    <i class="fas fa-copy cursor-pointer"></i>
                </td>
                <td class="p-4">
                    <i class="fas fa-ellipsis-v cursor-pointer"></i>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

loadCourses();
