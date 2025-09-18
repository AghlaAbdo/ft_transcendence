import fp from 'fastify-plugin'

const validationPlugin = async (fastify, options) => {
    fastify.addSchema({
        $id: "signupSchema", 
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
            username: {
                type: "string", 
                minLength: 3, 
                maxLength: 20,
                pattern: "^[a-zA-Z0-9_-]+$"
            },
            email: {
                type: "string", 
                format: "email",
                maxLength: 254
            },
            password: {
                type: "string", 
                minLength: 8,
                maxLength: 128
            }
        },
        additionalProperties: false
    });

    fastify.addSchema({
        $id: "loginSchema",
        type: 'object',
        required: ['email', 'password'],
        properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 1 }
        },
        additionalProperties: false
    });
}

export default fp(validationPlugin, {
    name: 'validation'
});

// client_id	um8smjabPNb1Dn5jszywfIh7
// client_secret	EoFC8U7C1aLnz04wkorybJQAowa6s192C5cxPRLmcYGEYyfS


// login	filthy-rook@example.com
// password	Anxious-Bat-38

// ?state=jicoEAgSHWk2MIuv&code=m3D5KKX1mcO4e2UoS1e-C9txIknvqV4ErI-jMY157fOlTCRN
