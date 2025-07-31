const io = require("socket.io")(5000, {
	cors: {
		origin: ["http://localhost:3000"],
	}
});

var fastify = require("fastify")({ logger: true });

// fastify.register(require("fastify-socket.io"), {
//     cors: {
//         origin: "http://localhost:3000",
//         methods: ["GET", "POST"]
//     }
// });

// const io = new Server(fastify.server);
// console.log("----------------\n Server: ", Server);
// console.log("----------------\n io: ", io);

fastify.get('/', function (request, reply) {
    reply.send({ hello: 'world' });
});

fastify.listen({ port: 4000 }, function (err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1);
    }
});


io.on('connection', (socket) => {
    console.log("connected to ", socket.id);
    
    io.emit('messageee', "Hello from the server ;)");
    socket.on('message', (msg) => {
        console.log("message recived: ", msg);
    })
    socket.on('disconnect', (reason) => {
        console.log(socket.id, " Disconnected becaus: ", reason);
    })
})
