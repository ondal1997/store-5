import express from 'express';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import morgan from 'morgan';
import database from './database';
import errorControl from './middlewares/error.middleware';
import router from './router/index';
import { serverConfig } from './config';

const PORT = serverConfig.port || 8080;

const server = express();
server.use(express.json());
server.use('/uploads', express.static(path.join(__dirname, '../uploads')));
server.use(express.static(path.join(__dirname, '../public')));
server.use(morgan('dev'));

server.use(
  cors({
    origin: serverConfig.origin_url,
    credentials: true,
  })
);

server.use(
  session({
    // HttpOnly: true,  https로 사용시에 옵션 주기
    secret: serverConfig.session_secret as string,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24000 * 60 * 60, domain: serverConfig.cookie_domain },
  })
);

server.use('/api', router);
server.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin_index.html'));
});

// fallback to index.html
server.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

server.use(errorControl);

database().then(() => {
  console.log('db connection');
  server.listen(PORT, async () => {
    console.log('server is running : ', PORT);
  });
});
