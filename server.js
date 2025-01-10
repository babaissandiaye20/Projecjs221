const jsonServer = require('json-server');
const fs = require('fs');
const server = jsonServer.create();
const middlewares = jsonServer.defaults();

// Vérifier si db.json existe, sinon le créer à partir du backup
if (!fs.existsSync('db.json')) {
    const initialData = fs.readFileSync('db-initial.json');
    fs.writeFileSync('db.json', initialData);
}

const router = jsonServer.router('db.json');

// Middleware pour sauvegarder les modifications
server.use((req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        // Sauvegarder dans db.json
        const data = JSON.stringify(router.db.getState(), null, 2);
        fs.writeFileSync('db.json', data);
        
        // Créer une copie de sauvegarde
        fs.writeFileSync('db-backup.json', data);
    }
    next();
});

server.use(middlewares);
server.use(router);

server.listen(3000, () => {
    console.log('JSON Server is running on port 3000');
});