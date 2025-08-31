// import Fastify, {FastifyInstance} from 'fastify'
// import FastifyHttpProxy from '@fastify/http-proxy'

// const fastify = Fastify({logger: true});
// const PORT: number = 4000;



// fastify.register(FastifyHttpProxy, {
//     upstream: 'http://localhost:4001',
//     prefix: '/socket.io/',
//     http2: false,
//     websocket: true,
// })

// // fastify.register(FastifyHttpProxy, {
// //     upstream: 'http://localhost:4001',
// //     prefix: '/game',
// //     http2: false,
// //     websocket: true,
// // })

// fastify.listen({ port: PORT }, function (err: Error | null, address: string) {
//     if (err) {
//         fastify.log.error(err);
//         process.exit(1);
//   }
// })


import Fastify from 'fastify';
import fastifyHttpProxy from '@fastify/http-proxy';

const PROXY_PORT = 4000; 
const GAME_SERVICE_URL = 'http://localhost:4001';
const proxyServer = Fastify({ logger: true });

proxyServer.register(fastifyHttpProxy, {
  upstream: GAME_SERVICE_URL,

  prefix: '/game',
    websocket: true, 
});


const startProxy = async () => {
  try {
    await proxyServer.listen({ port: PROXY_PORT });
    console.log(`Reverse Proxy listening on http://localhost:${PROXY_PORT}`);
    console.log(`Forwarding requests from /game/* to ${GAME_SERVICE_URL}`);
  } catch (err) {
    proxyServer.log.error(err);
    process.exit(1);
  }
};

startProxy();