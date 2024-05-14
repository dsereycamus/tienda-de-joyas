const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  allowExitOnIdle: true,
});

const getAllJewels = async () => {
  const consulta = "SELECT * FROM inventario";
  const result = await pool.query(consulta);
  return result.rows;
};

const getFilteredJewels = async (max, min, categoria, metal) => {
  const filtros = ["precio <$1", "precio>$2", "categoria=$3", "metal=$4"];
  const consulta = `SELECT * FROM inventario WHERE ${filtros.join(" and ")}`;
  const result = await pool.query(consulta, [max, min, categoria, metal]);
  return result.rows;
};

const getJewelById = async (id) => {
  const consulta = "SELECT * FROM inventario where id=$1";
  const result = await pool.query(consulta, [id]);
  return result.rows;
};

module.exports = { getAllJewels, getFilteredJewels, getJewelById };
