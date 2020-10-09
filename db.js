const Pool = require("pg").Pool;
const pool = new Pool({
    user: "postgres",
    password: "kccmall",
    host: "172.16.4.180",
    port: 5432,
    database: "interface",
});

module.exports = pool;
