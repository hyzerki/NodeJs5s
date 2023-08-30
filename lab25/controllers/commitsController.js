import { PrismaClient } from "@prisma/client";
import { ForbiddenError, subject } from "@casl/ability";
const prisma = new PrismaClient();


export default class CommitsController {
    static async getCommitsByRepoId(req, res, next) {
        try {
            ForbiddenError.from(req.ability).throwUnlessCan("read", "commits");
        } catch (error) {
            return next(error);
        }
        res.json(await prisma.commits.findMany({ where: { repoid: parseInt(req.params.repoId) } }));
    }

    static async getCommitByRepoIdAndCommitId(req, res, next) {
        try {
            ForbiddenError.from(req.ability).throwUnlessCan("read", "commits");
        } catch (error) {
            return next(error);
        }
        res.json(await prisma.commits.findUnique({ where: { repoid: parseInt(req.params.repoId), id: parseInt(req.params.commitId) } }));
    }

    static async createCommit(req, res, next) {
        try {

            let createdCommit = await prisma.$transaction(async (tx) => {
                let commit = await tx.commits.create({
                    data: {
                        ...req.body,
                        repos: {
                            connect: {
                                id: parseInt(req.params.repoId)
                            }
                        }
                    },
                    include: {
                        repos: true
                    }
                });
                ForbiddenError.from(req.ability).throwUnlessCan("create", subject("commits", commit));
                return commit;
            })
            res.json(createdCommit);
        } catch (error) {
            return next(error);
        }
    }

    static async updateCommit(req, res, next) {
        try {
            let updatedCommit = await prisma.$transaction(async (tx) => {
                let commit = await tx.commits.update({ data: req.body, where: { repoid: parseInt(req.params.repoId), id: parseInt(req.params.commitId) }, include: { repos: true } });
                console.log(commit);
                console.log(req.user);
                ForbiddenError.from(req.ability).throwUnlessCan("update", subject("commits", commit));
                return commit;
            })
            res.json(updatedCommit);
        } catch (error) {
            return next(error);
        }
    }

    static async deleteCommit(req, res, next) {
        try {
            let deletedCommit = await prisma.$transaction(async (tx) => {
                let commit = await tx.commits.delete({ where: { repoid: parseInt(req.params.repoId), id: parseInt(req.params.commitId) }, include: { repos: true } });
                ForbiddenError.from(req.ability).throwUnlessCan("delete", subject("commits", commit));
                return commit;
            })
            res.json(deletedCommit);
        } catch (error) {
            return next(error);
        }
    }
}