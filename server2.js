const express = require('express');
const axios = require('axios');
const serverless = require('serverless-http'); // Add this
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();

// Set up middleware and routes
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Your Airtable token
const airtableToken = 'Bearer YOUR_AIRTABLE_TOKEN';

app.post('/.netlify/functions/server/fetch-data', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const response = await axios.get(url, {
      headers: { Authorization: airtableToken },
    });
    io.emit('dataUpdate', response.data);
    res.json({ success: true });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

const server = http.createServer(app);
const io = new Server(server);
io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

module.exports.handler = serverless(app); // Export the handler for Netlify
