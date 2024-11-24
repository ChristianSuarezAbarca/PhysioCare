const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();

let generarToken = (login, rol, id) => {
    return jwt.sign({login: login, rol: rol, id: id}, process.env.SECRETO, {expiresIn: "2 hours"});
};

let validarToken = token => {
    try {
        let resultado = jwt.verify(token, process.env.SECRETO);
        return resultado;
    } catch (e) {}
}

let protegerRuta = (rolesPermitidos) => {
    return (req, res, next) => {
        let token = req.headers['authorization'];

        if (token) {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            let resultado = validarToken(token);

            if (resultado && rolesPermitidos.includes(resultado.rol)) {
                req.user = resultado;
                next();
            } else {
                res.status(403).send({ error: "Acceso no autorizado" });
            }
        } else {
            res.status(403).send({ error: "Acceso no autorizado" });
        }
    };
};

    
module.exports = {
    generarToken: generarToken,
    validarToken: validarToken,
    protegerRuta: protegerRuta
};