import express from "express";
import fs from "fs/promises";


const PORT = 4000;

const app = express();

app.use(express.json());


app.get("/pets", (req, res, next) => {
    fs.readFile("pets.json", "utf-8").then((data) => {
            const pets = JSON.parse(data)
            res.send(pets);
        })
        .catch(next)
});

app.get("/pets/:id", (req, res, next) => {
    const petIndex = req.params.id;
    fs.readFile("pets.json", "utf-8").then((data) => {
            const pets = JSON.parse(data)
            res.send(pets[petIndex]);
        })
        .catch(next)
});

app.delete("/pets/:id", (req, res) => {
    console.log("DELETE REQUEST CALLED")
    res.end();
});

let id = 1;
const createEntity = (data) => {
    return { id: id++, ...data };
}

app.post("/pets", (req, res) => {
    const newPet = createEntity(req.body);
    res.send(newPet);
    console.log(req.body);
});

app.patch("/pets/:id", (req, res, next) => {
    const index = req.params.id;
    console.log(index)
    fs.readFile("pets.json", "utf-8").then((str) => {
        const data = JSON.parse(str);
        const modded = data[index];
        console.log(data);
        if (req.body.name) {
            modded.name = req.body.name
        } else if (req.body.age) {
            modded.age = req.body.age
        } else if (req.body.kind) {
            modded.kind = req.body.kind
        }
        fs.writeFile("pets.json", JSON.stringify(data)).then(() => {
                res.send(modded);
            })
            .catch(next)
    })
});



app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
});