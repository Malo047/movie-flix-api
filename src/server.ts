import { PrismaClient } from "./generated/prisma";
import express from "express";


const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.get("/movies", async (req, res) => {
    const movies = await prisma.movies.findMany({
        include: {
            genre: true,
            language: true
        },
        orderBy: {
            title: "asc"
        }
    });
    res.json(movies);
});

// app.post("/movies", async (_, res) => {
//     await prisma.movies.create({
//         data:{
//             id: 16,
//             title: "O atirador",
//             release_date: "2016-07-25T12:00:00-03:00",
//             genre_id: 1,
//             language: "Portugues",
//             oscar_count: 2
//         }
//     })
//     res.status(201).send("Filme adicionado com sucesso")
// })

app.listen(port, () => {
    console.log(`Servidor em execução na porta ${port}`);
});