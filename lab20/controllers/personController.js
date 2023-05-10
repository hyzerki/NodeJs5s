const {Prisma, PrismaClient} = require("@prisma/client");
const { json } = require("express");
const asyncHandler = require("express-async-handler");

const prisma = new PrismaClient();

exports.get = asyncHandler(async (req, res, next) => {
    res.render("person.hbs", {personList: await prisma.person.findMany(), many: true});
    //res.send(await prisma.person.findMany());
})

exports.get_id = asyncHandler(async (req, res, next) => {
    res.render("person.hbs", { person: await prisma.person.findUnique({ where: { person_id: parseInt(req.params["id"]) } }) });
})

exports.post = asyncHandler(async (req, res, next) => {
    let result = await prisma.person.create({ data: req.body });
    res.send(result);
});

exports.put = asyncHandler(async (req, res, next) => {
    let result = await prisma.person.update({ where: { person_id: parseInt(req.params["id"]) }, data: req.body })
    res.send(result);
});

exports.delete = asyncHandler(async (req, res, next) => {
    let result = await prisma.person.delete({ where: { person_id: parseInt(req.params["id"]) } });
    res.send(result);
});
