import { PrismaClient } from "./generated/prisma"; //Ele é a maneira como faço a conexão do meu banco de dados.
import express from "express"; //Com ele crio as rotas para manipulação.


const port = 3000; //Define minha porta de serviço.
const app = express(); //Instacio o express para usar.
const prisma = new PrismaClient(); //Instancio o prisma para através dele manupular meu banco de dados.
app.use(express.json()); //Aqui serve para o express aceitar um JSON para o corpo da requisição.

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

app.post("/movies", async (req, res) => {
    try{
        const { title, release_date, genre_id, language_id, oscar_count} = req.body; //Aqui to desestruturando para receber os dados.
        
        await prisma.movies.create({
            data: {
                title: title, //E aqui é como se fosse title do banco de dados recebe req.body.title que é o conteudo do JSON do body.
                release_date: new Date(release_date),
                genre_id: genre_id,
                language_id: language_id,
                oscar_count: oscar_count
            }
        });
        res.status(201).send({message:"Filme cadastrado com sucesso."});
    }catch (error){
        console.log(error)
       res.status(500).send({message:"Erro ao cadastrar filme."});
    }

});
//Aqui é para retornar no terminal quando estiver rodando meu servidor.
app.listen(port, () => {
    console.log(`Servidor em execução na porta ${port}`);
}); 