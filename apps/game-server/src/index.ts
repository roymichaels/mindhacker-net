import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'colyseus';
import { monitor } from '@colyseus/monitor';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { config } from './config.js';
import { HubRoom } from './rooms/HubRoom.js';

const app = express();
app.use(cors({ origin: config.corsOrigin === '*' ? true : config.corsOrigin, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'game-server',
    env: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

const server = http.createServer(app);
const gameServer = new Server({
  transport: new WebSocketTransport({
    server,
  }),
});

gameServer.define('hub', HubRoom);
app.use('/colyseus', monitor());

server.listen(config.port, () => {
  console.log(`[game-server] listening on :${config.port}`);
});
