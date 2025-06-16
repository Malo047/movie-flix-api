import { PrismaClient } from "./generated/prisma"; //Ele é a maneira como faço a conexão do meu banco de dados.
import express from "express"; //Com ele crio as rotas para manipulação.


const port = 3000; //Define minha porta de serviço.
const app = express(); //Instacio o express para usar.
const prisma = new PrismaClient(); //Instancio o prisma para através dele manupular meu banco de dados.

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

app.post("/movies", async (_, res) => {
    await prisma.movies.create({
        data:{
            title: "Tropa de elite",
            release_date: "2014-05-05T12:00:00.000Z",
            genre_id: 1,
            language_id: 2,
            oscar_count: 2
        }
    })
    res.status(201).send("Filme adicionado com sucesso")
})
                                                            //Aqui é para retornar no terminal quando estiver rodando meu servidor.
app.listen(port, () => {
    console.log(`Servidor em execução na porta ${port}`);
}); 