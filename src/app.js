import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// Simular __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App base
const app = express();
const PORT = 3000;

// HTTP server + socket
const httpServer = http.createServer(app);
const io = new Server(httpServer);

// Datos simulados (sin DB por ahora)
let products = [];

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Rutas
app.get('/', (req, res) => {
  res.render('home', { products });
});

app.get('/realtimeproducts', (req, res) => {
  res.render('realTimeProducts');
});

// Websockets
io.on('connection', socket => {
  console.log('Cliente conectado');

  // Enviar lista inicial
  socket.emit('productList', products);

  // Nuevo producto
  socket.on('newProduct', product => {
    products.push(product);
    io.emit('productList', products);
  });

  // Eliminar producto
  socket.on('deleteProduct', id => {
    products = products.filter(p => p.id !== id);
    io.emit('productList', products);
  });
});

// Iniciar servidor
httpServer.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
