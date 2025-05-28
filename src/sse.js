const clients = [];

function addClient(res) {
  const id = Date.now();
  const newClient = { id, res };
  clients.push(newClient);
  console.log(`Nowy klient SSE: ${id}`);

  res.on('close', () => {
    removeClient(id);
  });
}

function removeClient(id) {
  const index = clients.findIndex(c => c.id === id);
  if (index !== -1) {
    clients.splice(index, 1);
    console.log(`Klient SSE odłączony: ${id}`);
  }
}

function broadcast(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  clients.forEach(client => client.res.write(payload));
}

module.exports = { addClient, broadcast };
