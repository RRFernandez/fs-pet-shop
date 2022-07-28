import express from "express";
import fs from "fs/promises";
import pg from "pg";

const PORT = 3000;

const app = express();

app.use(express.json());

const pool = new pg.Pool({
    database: 'petShop'
});

app.get("/pets", (req, res, next) => {
    pool.query('SELECT * FROM pets;').then((data) => {
            res.send(data.rows);
        })
        .catch(next)
});

app.get("/pets/:id", (req, res, next) => {
    const id = req.params.id;
    console.log(id);
    pool.query(`SELECT * FROM pets WHERE id = $1;`, [id]).then((data) => {
            const pet = data.rows[0];
            console.log(pet)
            res.send(pet);
        })
        .catch(next)
});

app.delete("/pets/:id", (req, res, next) => {
    const id = req.params.id;
    pool
        .query("DELETE FROM pets WHERE id = $1 RETURNING *;", [id])
        .then((data) => {
            if (data.rows.length === 0) {
                res.sendStatus(404);
            } else {
                res.sendStatus(204);
            }
        })
        .catch(next)
});

app.post("/pets", (req, res, next) => {
    const { age, name, kind } = req.body;
    pool.query(
            "INSERT INTO pets (age, name, kind) VALUES ($1, $2, $3) RETURNING *", [age, name, kind]
        )
        .then((result) => {
            res.send(result.rows[0]);
        })
        .catch(next)
});

app.patch("/pets/:id", (req, res, next) => {
    const id = Number(req.params.id);
    const { name, age, kind } = req.body;
    if (Number.isNaN(id)) {
        res.status(400).send(`invalid id given "${req.params.id}"`);
    }

    pool
        .query(
            `
        UPDATE pets
        SET name = COALESCE($1, name),
            age = COALESCE($2, age),
            kind = COALESCE($3, kind)
        WHERE id = $4
        RETURNING *;
        `, [name, age, kind, id]
        )
        .then((result) => {
            if (result.rows.length === 0) {
                res.sendStatus(404);
            } else {
                res.send(result.rows[0]);
            }
        }).catch(next)
});

app.use((err, req, res, next) => {
    res.sendStatus(500);
});

app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
});