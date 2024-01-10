import express from 'express'
import { config } from 'dotenv'
import pg from 'pg'
import cors from 'cors';

config()

const app = express();
const port = process.env.PORT || 3000;
const allowedOrigin = 'https://deep-set-bus.000webhostapp.com';
app.use(cors({ origin: allowedOrigin }));

app.use(express.json());


const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
})

app.get('/', (req, res) => {
    res.send('Hola mundo')
})

app.get('/ping', async(req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tb_usuarios');
        return res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener datos de la tabla:', error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});

//*********USUARIOS */
app.get('/usuarios', async(req, res) => {
    try {
        const getUsersQuery = 'SELECT * FROM tb_usuarios';
        const users = await pool.query(getUsersQuery);

        return res.status(200).json(users.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.post('/login', async(req, res) => {
    try {
        const { email, password } = req.body;

        const loginQuery = 'SELECT * FROM tb_usuarios WHERE email = $1 AND password = $2';
        const loginValues = [email, password];
        const loginResult = await pool.query(loginQuery, loginValues);

        if (loginResult.rowCount === 1) {
            // Usuario autenticado con éxito
            const user = loginResult.rows[0];
            const { password, ...userData } = user; // Excluye la contraseña de los datos del usuario
            return res.status(200).json({ message: 'Inicio de sesión exitoso', user: userData, userId: user.id });
        } else {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
app.get('/perfiluser/:idusuarios', async(req, res) => {
    const idusuario = req.params.idusuarios;

    try {
        const getPropertiesQuery = 'SELECT * FROM tb_usuarios WHERE idusuarios = $1';
        const properties = await pool.query(getPropertiesQuery, [idusuario]);

        return res.status(200).json(properties.rows);
    } catch (error) {
        console.error('Error retrieving properties:', error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
app.post('/register', async(req, res) => {
    try {
        const { cedula, nombres, apellidos, telefono, email, password, tipo } = req.body;

        const userExistQuery = 'SELECT * FROM tb_usuarios WHERE email = $1 OR cedula = $2';
        const userExistValues = [email, cedula];
        const userExistResult = await pool.query(userExistQuery, userExistValues);

        if (userExistResult.rowCount > 0) {
            return res.status(400).json({ error: 'El email ya esta registrado' });
        }

        const insertUserQuery = 'INSERT INTO tb_usuarios (cedula, nombres, apellidos, telefono, email, password,tipo) VALUES ($1, $2, $3, $4, $5, $6, $7)';
        const insertUserValues = [cedula, nombres, apellidos, telefono, email, password, tipo];
        await pool.query(insertUserQuery, insertUserValues);

        return res.status(201).json({ message: 'Registrado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
app.post('/obtenerTipoUsuario', async(req, res) => {
    try {
        const { email } = req.body;

        const obtenerTipoUsuarioQuery = 'SELECT tipo FROM tb_usuarios WHERE email = $1';
        const obtenerTipoUsuarioValues = [email];
        const tipoUsuarioResult = await pool.query(obtenerTipoUsuarioQuery, obtenerTipoUsuarioValues);

        if (tipoUsuarioResult.rowCount > 0) {
            const tipoUsuario = tipoUsuarioResult.rows[0].tipo;
            return res.status(200).json({ tipo: tipoUsuario });
        } else {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
app.post('/obtenerIdUsuario', async(req, res) => {
    try {
        const { email } = req.body;
        const obtenerIdUsuarioQuery = 'SELECT idusuarios FROM tb_usuarios WHERE email = $1';
        const obtenerIdUsuarioValues = [email];

        const IdUsuarioResult = await pool.query(obtenerIdUsuarioQuery, obtenerIdUsuarioValues);

        if (IdUsuarioResult.rowCount > 0) {
            const idusuarios = IdUsuarioResult.rows[0].idusuarios;
            return res.status(200).json({ idusuarios: idusuarios });
        } else {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
app.listen(port, () => {
    console.log(`Servidor en ejecución en http://localhost:${port}`);
});
app.delete('/eliminarusuario/:idusuarios', async(req, res) => {
    try {
        const productId = req.params.idusuarios;

        const deleteProductQuery = 'DELETE FROM tb_usuarios WHERE idusuarios = $1';
        await pool.query(deleteProductQuery, [productId]);

        return res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
//**CATEGORIAS ********************/
app.get('/listacategorias', async(req, res) => {
    try {
        const getUsersQuery = 'SELECT * FROM tb_categorias';
        const users = await pool.query(getUsersQuery);

        return res.status(200).json(users.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
app.post('/registrarcategoria', async(req, res) => {
    try {
        const { descripcion, estado } = req.body;

        const userExistQuery = 'SELECT * FROM tb_categorias WHERE descripcion = $1';
        const userExistValues = [descripcion];
        const userExistResult = await pool.query(userExistQuery, userExistValues);

        if (userExistResult.rowCount > 0) {
            return res.status(400).json({ error: 'El producto ya esta registrado' });
        }

        const insertUserQuery = 'INSERT INTO tb_categorias (descripcion, estado) VALUES ($1, $2)';
        const insertUserValues = [descripcion, estado];
        await pool.query(insertUserQuery, insertUserValues);

        return res.status(201).json({ message: 'Registrado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.get('/categoria/:idcategoria', async(req, res) => {
    try {
        const productId = req.params.idcategoria;
        const getProductQuery = 'SELECT * FROM tb_categorias WHERE idcategoria = $1';
        const product = await pool.query(getProductQuery, [productId]);

        if (product.rowCount === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        return res.status(200).json(product.rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.put('/editarcategoria/:idcategoria', async(req, res) => {
    try {
        const productId = req.params.idcategoria;
        const { descripcion, estado } = req.body;

        const updateProductQuery = 'UPDATE tb_categorias SET descripcion = $1, estado = $2 WHERE idcategoria = $3';
        const updateProductValues = [descripcion, estado, productId];
        await pool.query(updateProductQuery, updateProductValues);

        return res.status(200).json({ message: 'Producto actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.delete('/eliminarcategoria/:idcategoria', async(req, res) => {
    try {
        const productId = req.params.idcategoria;

        const deleteProductQuery = 'DELETE FROM tb_categorias WHERE idcategoria = $1';
        await pool.query(deleteProductQuery, [productId]);

        return res.status(200).json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
//**PRODUCTOS ********************/
app.get('/listaproductos', async(req, res) => {
    try {
        const getUsersQuery = `SELECT
        p.idproducto,
            p.nombre,
            p.descripcion,
            c.descripcion AS categoria,
            p.precio,
            p.stock,
            p.imagen
        FROM
        public.tb_productos p
        JOIN
        public.tb_categorias c ON p.idcategoria = c.idcategoria`;
        const users = await pool.query(getUsersQuery);

        return res.status(200).json(users.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
app.post('/registrarproducto', async(req, res) => {
    try {
        const { idcategoria, nombre, descripcion, precio, stock, imagen } = req.body;

        const userExistQuery = 'SELECT * FROM tb_productos WHERE nombre = $1';
        const userExistValues = [nombre];
        const userExistResult = await pool.query(userExistQuery, userExistValues);

        if (userExistResult.rowCount > 0) {
            return res.status(400).json({ error: 'El producto ya esta registrado' });
        }

        const insertUserQuery = 'INSERT INTO tb_productos (idcategoria, nombre, descripcion, precio, stock, imagen) VALUES ($1, $2, $3, $4, $5, $6)';
        const insertUserValues = [idcategoria, nombre, descripcion, precio, stock, imagen];
        await pool.query(insertUserQuery, insertUserValues);

        return res.status(201).json({ message: 'Registrado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }


});
app.get('/producto/:idproducto', async(req, res) => {
    try {
        const productId = req.params.idproducto;
        const getProductQuery = 'SELECT * FROM tb_productos WHERE idproducto = $1';
        const product = await pool.query(getProductQuery, [productId]);

        if (product.rowCount === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        return res.status(200).json(product.rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.put('/editarproducto/:idproducto', async(req, res) => {
    try {
        const productId = req.params.idproducto;
        const { idcategoria, nombre, descripcion, precio, stock, imagen } = req.body;

        const updateProductQuery = 'UPDATE tb_productos SET idcategoria = $1, nombre = $2, descripcion = $3, precio = $4, stock = $5, imagen =$6 WHERE idproducto = $7';
        const updateProductValues = [idcategoria, nombre, descripcion, precio, stock, imagen, productId];
        await pool.query(updateProductQuery, updateProductValues);

        return res.status(200).json({ message: 'Producto actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.delete('/eliminarproducto/:idproducto', async(req, res) => {
    try {
        const productId = req.params.idproducto;

        const deleteProductQuery = 'DELETE FROM tb_productos WHERE idproducto = $1';
        await pool.query(deleteProductQuery, [productId]);

        return res.status(200).json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});

////ESTEBAN API
app.get('/usuarios2', async(req, res) => {
    try {
        const getUsersQuery = 'SELECT * FROM tb_usuarios2';
        const users = await pool.query(getUsersQuery);

        return res.status(200).json(users.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
app.post('/login2', async(req, res) => {
    try {
        const { email, password } = req.body;

        const loginQuery = 'SELECT * FROM tb_usuarios2 WHERE email = $1 AND password = $2';
        const loginValues = [email, password];
        const loginResult = await pool.query(loginQuery, loginValues);

        if (loginResult.rowCount === 1) {
            // Usuario autenticado con éxito
            const user = loginResult.rows[0];
            const { password, ...userData } = user; // Excluye la contraseña de los datos del usuario
            return res.status(200).json({ message: 'Inicio de sesión exitoso', user: userData, userId: user.id });
        } else {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
app.get('/perfiluser2/:idusuarios', async(req, res) => {
    const idusuario = req.params.idusuarios;

    try {
        const getPropertiesQuery = 'SELECT * FROM tb_usuarios2 WHERE idusuarios = $1';
        const properties = await pool.query(getPropertiesQuery, [idusuario]);

        return res.status(200).json(properties.rows);
    } catch (error) {
        console.error('Error retrieving properties:', error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
app.post('/register2', async(req, res) => {
    try {
        const { cedula, nombres, apellidos, telefono, email, password, tipo } = req.body;

        const userExistQuery = 'SELECT * FROM tb_usuarios2 WHERE email = $1 OR cedula = $2';
        const userExistValues = [email, cedula];
        const userExistResult = await pool.query(userExistQuery, userExistValues);

        if (userExistResult.rowCount > 0) {
            return res.status(400).json({ error: 'El email ya esta registrado' });
        }

        const insertUserQuery = 'INSERT INTO tb_usuarios2 (cedula, nombres, apellidos, telefono, email, password,tipo) VALUES ($1, $2, $3, $4, $5, $6, $7)';
        const insertUserValues = [cedula, nombres, apellidos, telefono, email, password, tipo];
        await pool.query(insertUserQuery, insertUserValues);

        return res.status(201).json({ message: 'Registrado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
app.post('/obtenerTipoUsuario2', async(req, res) => {
    try {
        const { email } = req.body;

        const obtenerTipoUsuarioQuery = 'SELECT tipo FROM tb_usuarios2 WHERE email = $1';
        const obtenerTipoUsuarioValues = [email];
        const tipoUsuarioResult = await pool.query(obtenerTipoUsuarioQuery, obtenerTipoUsuarioValues);

        if (tipoUsuarioResult.rowCount > 0) {
            const tipoUsuario = tipoUsuarioResult.rows[0].tipo;
            return res.status(200).json({ tipo: tipoUsuario });
        } else {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
app.post('/obtenerIdUsuario2', async(req, res) => {
    try {
        const { email } = req.body;
        const obtenerIdUsuarioQuery = 'SELECT idusuarios FROM tb_usuarios2 WHERE email = $1';
        const obtenerIdUsuarioValues = [email];

        const IdUsuarioResult = await pool.query(obtenerIdUsuarioQuery, obtenerIdUsuarioValues);

        if (IdUsuarioResult.rowCount > 0) {
            const idusuarios = IdUsuarioResult.rows[0].idusuarios;
            return res.status(200).json({ idusuarios: idusuarios });
        } else {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
app.delete('/eliminarusuario2/:idusuarios', async(req, res) => {
    try {
        const productId = req.params.idusuarios;

        const deleteProductQuery = 'DELETE FROM tb_usuarios2 WHERE idusuarios = $1';
        await pool.query(deleteProductQuery, [productId]);

        return res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
//PROPIEDADES
app.get('/listapropiedades', async(req, res) => {
    try {
        const getUsersQuery = `SELECT
        p.idpropiedad,
        c.apellidos AS apellidos,
            p.tipo,
            p.titulo,
            p.mtotales,
            p.mcubiertos,
            p.habitaciones,
            p.cochera,
            p.banos,
            p.descripcion,
            p.direccion,
            p.telefono,
            p.precio,
            p.provincia,
            p.imagenes
        FROM
        public.tb_propiedades p
        JOIN
        public.tb_usuarios2 c ON p.idusuarios = c.idusuarios`;
        const users = await pool.query(getUsersQuery);

        return res.status(200).json(users.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
app.post('/registrarpropiedades', async(req, res) => {
    try {
        const { idusuarios, tipo, titulo, mtotales, mcubiertos, habitaciones, cochera, banos, descripcion, direccion, telefono, imagenes, precio, provincia } = req.body;

        const insertUserQuery = 'INSERT INTO tb_propiedades (idusuarios,tipo, titulo, mtotales, mcubiertos, habitaciones, cochera,banos,descripcion,direccion, telefono,imagenes, precio, provincia) VALUES ($1, $2, $3, $4, $5, $6, $7,$8,$9,$10,$11,$12, $13, $14)';
        const insertUserValues = [idusuarios, tipo, titulo, mtotales, mcubiertos, habitaciones, cochera, banos, descripcion, direccion, telefono, imagenes, precio, provincia];
        await pool.query(insertUserQuery, insertUserValues);

        return res.status(201).json({ message: 'Registrado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
app.get('/propiedades/:idpropiedad', async(req, res) => {
    try {
        const productId = req.params.idpropiedad;
        const getProductQuery = 'SELECT * FROM tb_propiedades WHERE idpropiedad = $1';
        const product = await pool.query(getProductQuery, [productId]);

        if (product.rowCount === 0) {
            return res.status(404).json({ error: 'propiedad no encontrada' });
        }
        return res.status(200).json(product.rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
app.put('/editarpropiedad/:idpropiedad', async(req, res) => {
    try {
        const productId = req.params.idpropiedad;
        const { tipo, titulo, mtotales, mcubiertos, habitaciones, cochera, banos, descripcion, direccion, telefono, precio, provincia } = req.body;

        const updateProductQuery = `UPDATE tb_propiedades 
        SET tipo = $1, titulo = $2, mtotales = $3, mcubiertos = $4, habitaciones = $5,
            cochera = $6, banos = $7, descripcion = $8, direccion = $9, telefono = $10,
             precio = $11, provincia = $12
        WHERE idpropiedad = $13`;
        const updateProductValues = [tipo, titulo, mtotales, mcubiertos, habitaciones, cochera, banos, descripcion, direccion, telefono, precio, provincia, productId];
        await pool.query(updateProductQuery, updateProductValues);

        return res.status(200).json({ message: 'propiedad actualizada exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
app.delete('/eliminarpropiedad/:idpropiedad', async(req, res) => {
    try {
        const productId = req.params.idpropiedad;

        const deleteProductQuery = 'DELETE FROM tb_propiedades WHERE idpropiedad = $1';
        await pool.query(deleteProductQuery, [productId]);

        return res.status(200).json({ message: 'Propiedad eliminada exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});