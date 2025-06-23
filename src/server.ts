import { PrismaClient } from "@prisma/client"; //Ele é a maneira como faço a conexão do meu banco de dados.
import express from "express"; //Com ele crio as rotas para manipulação.
import swaggerUi from "swagger-ui-express"
import swaggerDocument from "../src/swagger.json"

const port = 3000; //Define minha porta de serviço.
const app = express(); //Instacio o express para usar.
const prisma = new PrismaClient(); //Instancio o prisma para através dele manupular meu banco de dados.
app.use(express.json()); //Aqui serve para o express aceitar um JSON para o corpo da requisição.
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/movies", async (_, res) => {
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
    return
});
app.get("/movies/:genreName", async (req, res) => {
    //receber o nome do genero
    //filtrar os filmes pelo genero
    //retornar os filmes 
    try {
        const newGenre = req.params.genreName;
        const moviesFilteredByGenerName = await prisma.movies.findMany({
            include: {
                genre: true,
                language: true
            },
            where: {
                genre: {
                    genre: {
                        equals: newGenre,
                        mode: "insensitive"
                    },
                },
            }
        });
        res.status(200).json(moviesFilteredByGenerName);
        return

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Não foi possivel conectar ao servidor." });
        return
    }


});
app.put("/movies/:id", async (req, res) => {
    const id = Number(req.params.id); // Transformando string que vem do req para number.
    const data = { ...req.body };
    data.release_date = data.release_date ? new Date(data.release_date) : undefined; // Convertendo String para data se a data for válida.

    try {
        const movie = await prisma.movies.findUnique({
            where: {
                id: id,
            }
        });

        if (!movie) {
            res.status(404).send({ message: "Filme não encontrado" });
            return
        };
        await prisma.movies.update({
            where: {
                id: id,
            },
            data: data,
        });
        res.status(200).send({ message: "Alterado com sucesso." });
        return

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Não foi possível alterar o filme." });
        return
    }
});
app.post("/movies", async (req, res) => {
    try {
        const { title, release_date, genre_id, language_id, oscar_count } = req.body; //Aqui to desestruturando para receber os dados.

        const duplicatedTitle = await prisma.movies.findFirst({
            where: {
                title: { equals: title, mode: "insensitive" },  //Aqui verifica o titulo como um ignoreCase.
            }
        });
        if (duplicatedTitle) {
            res.status(409).send({ message: "Filme já cadastrado." })
            return
        };

        await prisma.movies.create({
            data: {
                title: title, //E aqui é como se fosse title do banco de dados recebe req.body.title que é o conteudo do JSON do body.
                release_date: new Date(release_date),
                genre_id: genre_id,
                language_id: language_id,
                oscar_count: oscar_count
            }
        });
        res.status(201).send({ message: "Filme cadastrado com sucesso." });
        return
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: "Erro ao cadastrar filme." });
        return
    }

});
app.delete("/movies/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {
        const movie = await prisma.movies.findUnique({
            where: {
                id: id,
            }
        });

        if (!movie) {
            res.status(404).send({ message: "Filme não encontrado" });
            return
        };

        await prisma.movies.delete({
            where: {
                id: id,
            }
        });
        res.status(200).send({ mwssage: "Filme deletado com sucesso." });
        return
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Erro ao deletar filme." });
        return
    }

});
app.put("/genres/:id", async (req, res) => {
    const id = Number(req.params.id);
    const data = { ...req.body }
    try {
        const movie = await prisma.movies.findUnique({
            where: {
                id: id
            }
        });
        if (!movie) {
            res.status(404).send({ message: "Filme não encontrado" });
            return
        };
        await prisma.movies.update({
            where: {
                id: id
            },
            data: data
        });
        res.status(200).send({ message: "Alterado com sucesso." });
        return
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Não foi possivel fazer a alteração." });
        return
    }
});
app.post("/genres", async (req, res) => {
    const { newGenre } = req.body;

    try {
        const genre = await prisma.genres.findFirst({
            where: {
                genre: {equals:newGenre, mode: "insensitive"}
            }
        });
        if(!genre){
            await prisma.genres.create({
                data: {
                    genre: newGenre,
                }
            });
            res.status(201).send({message: "Genêro cadastrado com sucesso."});
            return
        }
        res.status(409).send({message: "Genêro já existe"});
        return

    } catch (error) {
        res.status(500).send({message: "Não foi possível cadastrar o genêro"});
        return
    }
});
app.get("/genres", async (_, res) => {
    try{
    const allGenres = await prisma.genres.findMany({
        orderBy: {
            genre: "asc"
        },
    });
    res.json(allGenres);
    }catch(error){
        console.log(error);
        res.status(500).send({message: "Não foi possível buscar a lista de genêros."});
        return
    }
});
//Aqui é para retornar no terminal quando estiver rodando meu servidor.
app.listen(port, () => {
    console.log(`Servidor em execução na porta ${port}`);
}); 