const Pool = require("pg").Pool;
const pool = new Pool({
    user: "rnddev",
    password: "kccmall",
    host: "192.168.32.127",
    port: 5432,
    database: "turnstile",
});

module.exports = pool;
