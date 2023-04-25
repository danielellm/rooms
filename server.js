// Laden Sie die erforderlichen Module
const express = require('express');
const http = require('http');
const socketio = require('socket.io');

// Erstellen Sie eine neue Express-App
const app = express();
// Erstellen Sie einen HTTP-Server mit der Express-App
const server = http.createServer(app);
// Erstellen Sie einen Socket.io-Server auf dem HTTP-Server
const io = socketio(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/master', (req, res) => {
  res.sendFile(__dirname + '/public/master.html');
});

app.get('/client', (req, res) => {
  res.sendFile(__dirname + '/public/client.html');
});


// Starten Sie den HTTP-Server
server.listen(3000, () => {
  console.log('Server started on port 3000');
});

// Erstellen Sie einen Master-Socket
let masterSocket;
// Speichern Sie alle aktiven Räume
const activeRooms = new Set();

// Behandeln Sie eine Verbindung mit dem Server
io.on('connection', (socket) => {
  console.log('A client connected');

  // Wenn der Client ein Master ist, speichern Sie seinen Socket
  socket.on('master', () => {
    console.log('Master connected');
    masterSocket = socket;
  });

  // Wenn der Client eine Nachricht sendet, leiten Sie sie an den Master-Socket weiter
  socket.on('message', (message) => {
    console.log('Message received:', message);
    if (masterSocket) {
      masterSocket.emit('message', message);
    }
  });

  // Wenn der Client eine neue Raum erstellt
  socket.on('createRoom', (room) => {
    console.log('Room created:', room);
    // Fügen Sie den Raum zur Liste der aktiven Räume hinzu
    activeRooms.add(room);
    // Treten Sie dem Socket des Clients bei, der den Raum erstellt hat
    socket.join(room);
  });

  // Wenn der Client einem Raum beitritt
  socket.on('joinRoom', (room, role) => {
    console.log('Client joined room:', room);
    // Wenn der Raum aktiv ist, treten Sie dem Socket des Clients bei
    if (activeRooms.has(room)) {
      socket.join(room);
    }
  });

  // Wenn der Client den Raum verlässt
  socket.on('leaveRoom', (room) => {
    console.log('Client left room:', room);
    // Verlassen Sie den Socket des Clients
    socket.leave(room);
  });

  // Behandeln Sie die Trennung vom Server
  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});
