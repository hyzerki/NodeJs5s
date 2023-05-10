const {Prisma, PrismaClient} = require("@prisma/client");
const { json } = require("express");
const asyncHandler = require("express-async-handler");

const prisma = new PrismaClient();

exports.get = asyncHandler(async (req, res, next) => {
    res.render("company.hbs", {companyList: await prisma.company.findMany(), many: true});
    //res.send(await prisma.company.findMany());
})

exports.get_id = asyncHandler(async (req, res, next) => {
    res.render("company.hbs", { company: await prisma.company.findUnique({ where: { company_id: parseInt(req.params["id"]) } }) });
})

exports.post = asyncHandler(async (req, res, next) => {
    console.log(req.body);
    let result = await prisma.company.create({ data: req.body });
    res.send(result);
});

exports.put = asyncHandler(async (req, res, next) => {
    let result = await prisma.company.update({ where: { company_id: parseInt(req.params["id"]) }, data: req.body })
    res.send(result);
});

exports.delete = asyncHandler(async (req, res, next) => {
    let result = await prisma.company.delete({ where: { company_id: parseInt(req.params["id"]) } });
    res.send(result);
});
