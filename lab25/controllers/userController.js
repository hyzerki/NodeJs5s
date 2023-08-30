import { PrismaClient } from "@prisma/client";
import { ForbiddenError, subject } from "@casl/ability";
const prisma = new PrismaClient();


export default class userController {
    static async getUserById(req, res, next) {
        let user = await prisma.users.findUnique({ select: { id: true, email: true, role: true, username: true }, where: { id: parseInt(req.params.userId) } });
        try{
            ForbiddenError.from(req.ability).throwUnlessCan("read", subject("users",user));
        }catch(error){
            console.log(error.message);
            return next(error);
        }
        res.json(user);
    }

    static async getUsers(req, res) {
        let users = await prisma.users.findMany({ select: { id: true, email: true, role: true, username: true } });
        users = users.filter(user => req.ability.can("read", subject("users",user)));
        res.json(users);
    }
}