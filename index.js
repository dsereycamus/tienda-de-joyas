const express = require("express");
require("dotenv").config();
const cors = require("cors");
const {
  getAllJewels,
  getJewelById,
  getFilteredJewels,
} = require("./consultas");
const { orders } = require("./utils");

const app = express();

app.use(express.json());
app.use(cors());

app.listen(3000, () => {
  console.log("¡Servidor encendido!");
});

app.use((req, _res, next) => {
  const now = new Date();
  const showMore = process.env.SHOW_MORE_INFO === "true";
  console.log(
    `[${now.toLocaleString("es-CL")}]: Se ha consultado la ruta de ${
      showMore ? req.originalUrl : req.path
    }`
  );

  next();
});

app.get("/joyas", async (req, res) => {
  try {
    let { page, limit, order } = req.query;
    page = parseInt(page - 1);
    limit = parseInt(limit);
    if (page === undefined) throw new Error("Debes ingresar la página");
    if (page && isNaN(page))
      throw new Error("La página debe ser un número entero");
    if (!limit) throw new Error("Debes ingresar el límite");
    if (limit && isNaN(limit))
      throw new Error("El límite debe ser un número entero");
    if (!order) throw new Error("Debes ingresar el orden");
    if (order && !Object.keys(orders).includes(order.toUpperCase()))
      throw new Error("Los valores para orden disponibles son ASC y DESC");
    const joyas = await getAllJewels();
    const maxPages = Math.ceil(joyas.length / limit);
    if (page + 1 > maxPages)
      throw new Error("La página seleccionada no existe.");
    const filtered = joyas
      .sort((a, b) =>
        order.toUpperCase() === "ASC" ? a.stock - b.stock : b.stock - a.stock
      )
      .slice(page * limit, limit * (page + 1))
      .map((joya) => ({
        name: joya.nombre,
        href: `/joyas/joya/${joya.id}`,
      }));

    return res.status(200).json({
      totalJoyas: filtered.length,
      stockTotal: joyas.length,
      paginas: maxPages,
      results: filtered,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

app.get("/joyas/filtros", async (req, res) => {
  try {
    const { precio_min, precio_max, categoria, metal } = req.query;

    if (!precio_max || !precio_min || !categoria || !metal)
      throw new Error("Debes ingresar todos los filtros.");

    if (isNaN(parseInt(precio_max)))
      throw new Error("Precio máximo sólo puede ser número.");

    if (isNaN(parseInt(precio_min)))
      throw new Error("Precio mínimo sólo puede ser número.");

    if (parseInt(precio_min) > parseInt(precio_max))
      throw new Error("El precio mínimo no puede ser mayor al precio máximo");

    if (!["oro", "plata"].includes(metal.toLowerCase()))
      throw new Error("Debes colocar un metal válido.");

    if (!["collar", "aros", "anillo"].includes(categoria.toLowerCase()))
      throw new Error("Debes colocar un categoría válida.");

    const joyas = await getFilteredJewels(
      precio_max,
      precio_min,
      categoria.toLowerCase(),
      metal.toLowerCase()
    );

    return res.status(200).json(joyas);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

app.get("/joyas/joya/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(parseInt(id)))
      throw new Error("El ID ingresado no es un número.");
    const joya = await getJewelById(parseInt(id));
    if (joya.length === 0)
      return res
        .status(404)
        .json({ message: `No se ha encontrado la joya con ID ${id}` });
    return res.status(200).json(joya[0]);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});
