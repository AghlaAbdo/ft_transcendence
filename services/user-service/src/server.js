import createApp from "./app.js";

const fastify = createApp();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';



const start = async () => {
    try {
        await fastify.listen({
            port: PORT,
            host: HOST
        });
        console.log(`User service running on http://${HOST}:${PORT}`);
        // fastify.log.info(`Server runing on port ${fastify.server.address().port}`);

    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

start();