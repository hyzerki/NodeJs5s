import { PrismaClient } from "@prisma/client";
import { ForbiddenError, subject } from "@casl/ability";
const prisma = new PrismaClient();



export default class ReposController {
    static async getRepoById(req, res, next) {
        let repo = await prisma.repos.findUnique({ where: { id: parseInt(req.params.repoId) } })
        try {
            ForbiddenError.from(req.ability).throwUnlessCan("read", subject("repos", repo));
        } catch (error) {
            return next(error);
        }
        res.json(repo);
    }

    static async getRepos(req, res) {
        let repos = await prisma.repos.findMany();
        repos = repos.filter(repo => req.ability.can("read", subject("repos", repo)));
        res.json(repos);
    }

    static async createRepo(req, res, next) {
        try {
            let createdRepo = await prisma.$transaction(async (tx) => {
                let repo = await tx.repos.create({ data: req.body });
                ForbiddenError.from(req.ability).throwUnlessCan("create", subject("repos", repo));
                return repo;
            });
            res.json(createdRepo);
        } catch (error) {
            return next(error);
        }
    }

    static async updateRepo(req, res, next) {

        try {
            let updatedRepo = await prisma.$transaction(async (tx) => {
                let repo = await tx.repos.update({ data: req.body, where: { id: parseInt(req.params.repoId) } });
                ForbiddenError.from(req.ability).throwUnlessCan("update", subject("repos", repo));
                return repo;
            })
            res.json(updatedRepo);
        } catch (error) {
            return next(error);
        }
    }

    static async deleteRepo(req, res, next) {
        try {
            let deletedRepo = await prisma.$transaction(async (tx) => {
                let repo = await tx.repos.delete({ where: { id: parseInt(req.params.repoId) } });
                ForbiddenError.from(req.ability).throwUnlessCan("delete", subject("repos", repo));
                return repo;
            })
            res.json(deletedRepo);
        } catch (error) {
            return next(error);
        }
    }
}