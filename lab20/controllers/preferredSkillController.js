const {Prisma, PrismaClient} = require("@prisma/client");
const { json } = require("express");
const asyncHandler = require("express-async-handler");

const prisma = new PrismaClient();

exports.get = asyncHandler(async (req, res, next) => {
    res.render("skill.hbs", {skillList: await prisma.preffered_skill.findMany(), many: true});
    //res.send(await prisma.preffered_skill.findMany());
})

exports.get_id = asyncHandler(async (req, res, next) => {
    res.render("skill.hbs", { skill: await prisma.preffered_skill.findUnique({ where: { preffered_skill_id: parseInt(req.params["id"]) } }) });
})

exports.post = asyncHandler(async (req, res, next) => {
    console.log(req.body);
    let result = await prisma.preffered_skill.create({ data: req.body });
    res.send(result);
});

exports.put = asyncHandler(async (req, res, next) => {
    let result = await prisma.preffered_skill.update({ where: { preffered_skill_id: parseInt(req.params["id"]) }, data: req.body })
    res.send(result);
});

exports.delete = asyncHandler(async (req, res, next) => {
    let result = await prisma.preffered_skill.delete({ where: { preffered_skill_id: parseInt(req.params["id"]) } });
    res.send(result);
});

