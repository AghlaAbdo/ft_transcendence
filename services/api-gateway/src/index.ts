import Fastify, {FastifyInstance} from 'fastify'
import FastifyHttpProxy from '@fastify/http-proxy'

const fastify = Fastify({logger: true});
const PORT: number = 4000;



fastify.register(FastifyHttpProxy, {
    upstream: 'http://localhost:4001',
    prefix: '/socket.io/',
    http2: false,
    websocket: true,
})

// fastify.register(FastifyHttpProxy, {
//     upstream: 'http://localhost:4001',
//     prefix: '/game',
//     http2: false,
//     websocket: true,
// })

fastify.listen({ port: PORT }, function (err: Error | null, address: string) {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
  }
})