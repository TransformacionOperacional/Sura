module.exports = async function (context, req) {
    context.log("API Solicitudes ejecutándose");

    const method = req.method;

    if (method === "GET") {
        context.res = {
            status: 200,
            body: {
                message: "API funcionando correctamente",
                data: []
            }
        };
    }

    if (method === "POST") {
        const body = req.body;

        context.res = {
            status: 200,
            body: {
                message: "Solicitud recibida",
                received: body
            }
        };
    }
};