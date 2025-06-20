"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client"); //Ele é a maneira como faço a conexão do meu banco de dados.
const express_1 = __importDefault(require("express")); //Com ele crio as rotas para manipulação.
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_json_1 = __importDefault(require("../src/swagger.json"));
const port = 3000; //Define minha porta de serviço.
const app = (0, express_1.default)(); //Instacio o express para usar.
const prisma = new client_1.PrismaClient(); //Instancio o prisma para através dele manupular meu banco de dados.
app.use(express_1.default.json()); //Aqui serve para o express aceitar um JSON para o corpo da requisição.
app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
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
app.get("/movies/:genreName", async (req, res) => {
    //receber o nome do genero
    //filtrar os filmes pelo genero
    //retornar os filmes 
    try {
        const genre = req.params.genreName;
        const moviesFilteredByGenerName = await prisma.movies.findMany({
            include: {
                genre: true,
                language: true
            },
            where: {
                genre: {
                    genre: {
                        equals: genre,
                        mode: "insensitive"
                    },
                },
            }
        });
        res.json(moviesFilteredByGenerName);
        res.status(200);
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: "Não foi possivel conectar ao servidor." });
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
            return;
        }
        ;
        await prisma.movies.update({
            where: {
                id: id,
            },
            data: data,
        });
        res.status(200).send({ message: "Alterado com sucesso." });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: "Não foi possível alterar o filme." });
        return;
    }
});
app.post("/movies", async (req, res) => {
    try {
        const { title, release_date, genre_id, language_id, oscar_count } = req.body; //Aqui to desestruturando para receber os dados.
        const duplicatedTitle = await prisma.movies.findFirst({
            where: {
                title: { equals: title, mode: "insensitive" }, //Aqui verifica o titulo como um ignoreCase.
            }
        });
        if (duplicatedTitle) {
            res.status(409).send({ message: "Filme já cadastrado." });
            return;
        }
        ;
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
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: "Erro ao cadastrar filme." });
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
            return;
        }
        ;
        await prisma.movies.delete({
            where: {
                id: id,
            }
        });
        res.status(200).send({ mwssage: "Filme deletado com sucesso." });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: "Erro ao deletar filme." });
    }
});
//Aqui é para retornar no terminal quando estiver rodando meu servidor.
app.listen(port, () => {
    console.log(`Servidor em execução na porta ${port}`);
});
