"use strict";

module.exports = function _callee(context, req) {
  var method, body;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          context.log("API Solicitudes ejecutándose");
          method = req.method;

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
            body = req.body;
            context.res = {
              status: 200,
              body: {
                message: "Solicitud recibida",
                received: body
              }
            };
          }

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
};
//# sourceMappingURL=index.dev.js.map
