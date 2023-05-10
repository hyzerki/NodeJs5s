const {Prisma, PrismaClient} = require("@prisma/client");
const { json } = require("express");
const asyncHandler = require("express-async-handler");

const prisma = new PrismaClient();

exports.get = asyncHandler(async (req, res, next) => {
    res.render("vacancy.hbs", {vacancyList: await prisma.vacancy.findMany(), many: true});
    //res.send(await prisma.vacancy.findMany());
})

exports.get_id = asyncHandler(async (req, res, next) => {
    res.render("vacancy.hbs", { vacancy: await prisma.vacancy.findUnique({ where: { vacancy_id: parseInt(req.params["id"]) } }) });
})

exports.post = asyncHandler(async (req, res, next) => {
    console.log(req.body);
    let result = await prisma.vacancy.create({ data: req.body });
    res.send(result);
});

exports.put = asyncHandler(async (req, res, next) => {
    let result = await prisma.vacancy.update({ where: { vacancy_id: parseInt(req.params["id"]) }, data: req.body })
    res.send(result);
});

exports.delete = asyncHandler(async (req, res, next) => {
    let result = await prisma.vacancy.delete({ where: { vacancy_id: parseInt(req.params["id"]) } });
    res.send(result);
});
