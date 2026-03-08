const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "IGRAI.RU API",
            version: "1.0.0",
            description: "API игрового магазина",
        },
        servers: [
            {
                url: "http://localhost:3000",
            },
        ],
    },
    apis: ["./server.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;