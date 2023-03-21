import { PrismaClient } from "@prisma/client";
import fs from "fs";
import http from "http";
import url from "url";

const prisma = new PrismaClient();

console.log("Database model initialization and connection succeed!");

const server = http.createServer(async (req, res) => {

    const buffers = [];
    for await (const chunk of req) {
        buffers.push(chunk);
    }
    let rawBodyString = Buffer.concat(buffers).toString();
    let bodyObject = null;
    try {
        bodyObject = JSON.parse(rawBodyString);
    } catch (e) {
    }
    let dUrl = url.parse(decodeURI(req.url), true);
    let pathParts = dUrl.path.split("/");
    console.log(dUrl.pathname);
    console.log(dUrl.path);
    console.log(pathParts);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    try {
        if (req.method === "GET") {
            if (dUrl.path === "/") {
                res.setHeader("Content-Type", "text/html; charset=utf-8");
                fs.createReadStream("./index.html").pipe(res);
                return;
            } else if (dUrl.path === "/api/transaction") {

                res.write(JSON.stringify(result));
            } else if (dUrl.path === "/api/faculties") {
                res.write(JSON.stringify(await prisma.FACULTY.findMany()));
            } else if (dUrl.path === "/api/pulpits") {
                res.write(JSON.stringify(await prisma.PULPIT.findMany()));
            } else if (dUrl.path === "/api/subjects") {
                res.write(JSON.stringify(await prisma.SUBJECT.findMany()));
            } else if (dUrl.path === "/api/teachers") {
                res.write(JSON.stringify(await prisma.TEACHER.findMany()));
            } else if (dUrl.path === "/api/auditoriumtypes") {
                res.write(JSON.stringify(await prisma.AUDITORIUM_TYPE.findMany()));
            } else if (dUrl.path === "/api/auditoriums") {
                res.write(JSON.stringify(await prisma.AUDITORIUM.findMany()));
            } else if (dUrl.path === "/api/auditoriumsWithComp1") {
                res.write(JSON.stringify(await prisma.AUDITORIUM.findMany({ where: { AUDITORIUM_NAME: { endsWith: "-1" }, OR: [{ AUDITORIUM_TYPE: "ЛБ-К" }, { AUDITORIUM_TYPE: "ЛБ-CК" }, { AUDITORIUM_TYPE: "ЛК-К" },] } })));
            } else if (dUrl.path === "/api/pulpitsWithoutTeachers") {
                res.write(JSON.stringify(await prisma.PULPIT.findMany({ where: { TEACHER_TEACHER_PULPITToPULPIT: { none: {} } } })));
            } else if (dUrl.path === "/api/pulpitsWithVladimir") {
                res.write(JSON.stringify(await prisma.TEACHER.findMany({ where: { TEACHER_NAME: { contains: "владимир" } }, select: { PULPIT_TEACHER_PULPITToPULPIT: { select: { PULPIT: true, PULPIT_NAME: true } } } })));
            } else if (dUrl.path === "/api/auditoriumsSameCount") {
                res.write(JSON.stringify(await prisma.AUDITORIUM.groupBy({ by: ["AUDITORIUM_TYPE", "AUDITORIUM_CAPACITY"], _count: { _all: true } })));
            } else if (dUrl.path === "/api/pulpits/count") {
                res.write(JSON.stringify(await prisma.PULPIT.count({ select: { _all: true } })));
            } else if (new RegExp(/^\/api\/pulpits\/\d+$/).test(dUrl.path)) {
                res.write(JSON.stringify(await prisma.PULPIT.findMany({ skip: (parseInt(pathParts[3]) - 1) * 10, take: 10, include: { _count: { select: { TEACHER_TEACHER_PULPITToPULPIT: true } } } })));
            } else if (new RegExp(/^\/api\/faculties\/\S+\/subjects$/).test(dUrl.path)) {
                res.write(JSON.stringify(await prisma.FACULTY.findUnique({ where: { FACULTY: pathParts[3] }, select: { FACULTY: true, PULPIT_PULPIT_FACULTYToFACULTY: { select: { SUBJECT_SUBJECT_PULPITToPULPIT: { select: { SUBJECT_NAME: true } } } } } })));
            } else if (new RegExp(/^\/api\/auditoriumtypes\/\S+\/auditoriums$/).test(dUrl.path)) {
                res.write(JSON.stringify(await prisma.AUDITORIUM_TYPE.findUnique({ where: { AUDITORIUM_TYPE: pathParts[3] } }).AUDITORIUM_AUDITORIUM_AUDITORIUM_TYPEToAUDITORIUM_TYPE()));
            } else {
                res.statusCode = 404;
            }
        } else if (req.method === "POST" && bodyObject !== null) {
            if (dUrl.path === "/api/faculties") {
                res.write(JSON.stringify(await prisma.FACULTY.create({ data: bodyObject })));
            } else if (dUrl.path === "/api/pulpits") {
                res.write(JSON.stringify(await prisma.PULPIT.create({ data: bodyObject })));
            } else if (dUrl.path === "/api/subjects") {
                res.write(JSON.stringify(await prisma.SUBJECT.create({ data: bodyObject })));
            } else if (dUrl.path === "/api/teachers") {
                res.write(JSON.stringify(await prisma.TEACHER.create({ data: bodyObject })));
            } else if (dUrl.path === "/api/auditoriumtypes") {
                res.write(JSON.stringify(await prisma.AUDITORIUM_TYPE.create({ data: bodyObject })));
            } else if (dUrl.path === "/api/auditoriums") {
                res.write(JSON.stringify(await prisma.AUDITORIUM.create({ data: bodyObject })));
            } else {
                res.statusCode = 404;
            }
        } else if (req.method === "PUT" && bodyObject !== null) {
            if (dUrl.path === "/api/faculties") {
                res.write(JSON.stringify(await prisma.FACULTY.update({ where: { FACULTY: bodyObject.FACULTY }, data: bodyObject })));
            } else if (dUrl.path === "/api/pulpits") {
                res.write(JSON.stringify(await prisma.PULPIT.update({ where: { PULPIT: bodyObject.PULPIT }, data: bodyObject })));
            } else if (dUrl.path === "/api/subjects") {
                res.write(JSON.stringify(await prisma.SUBJECT.update({ where: { SUBJECT: bodyObject.SUBJECT }, data: bodyObject })));
            } else if (dUrl.path === "/api/teachers") {
                res.write(JSON.stringify(await prisma.TEACHER.update({ where: { TEACHER: bodyObject.TEACHER }, data: bodyObject })));
            } else if (dUrl.path === "/api/auditoriumtypes") {
                res.write(JSON.stringify(await prisma.AUDITORIUM_TYPE.update({ where: { AUDITORIUM_TYPE: bodyObject.AUDITORIUM_TYPE }, data: bodyObject })));
            } else if (dUrl.path === "/api/auditoriums") {
                res.write(JSON.stringify(await prisma.AUDITORIUM.update({ where: { AUDITORIUM: bodyObject.AUDITORIUM }, data: bodyObject })));
            } else {
                res.statusCode = 404;
            }
        } else if (req.method === "DELETE") {
            if (new RegExp(/^\/api\/faculties\/\S+$/).test(dUrl.path)) {
                res.write(JSON.stringify(await prisma.FACULTY.delete({ where: { FACULTY: pathParts[3] } })));
            } else if (new RegExp(/^\/api\/pulpits\/\S+$/).test(dUrl.path)) {
                res.write(JSON.stringify(await prisma.PULPIT.delete({ where: { PULPIT: pathParts[3] } })));
            } else if (new RegExp(/^\/api\/subjects\/\S+$/).test(dUrl.path)) {
                res.write(JSON.stringify(await prisma.SUBJECT.delete({ where: { SUBJECT: pathParts[3] } })));
            } else if (new RegExp(/^\/api\/teachers\/\S+$/).test(dUrl.path)) {
                res.write(JSON.stringify(await prisma.TEACHER.delete({ where: { TEACHER: pathParts[3] } })));
            } else if (new RegExp(/^\/api\/auditoriumtypes\/\S+$/).test(dUrl.path)) {
                res.write(JSON.stringify(await prisma.AUDITORIUM_TYPE.delete({ where: { AUDITORIUM_TYPE: pathParts[3] } })));
            } else if (new RegExp(/^\/api\/auditiums\/\S+$/).test(dUrl.path)) {
                res.write(JSON.stringify(await prisma.AUDITORIUM.delete({ where: { AUDITORIUM_TYPE: pathParts[3] } })));
            } else {
                res.statusCode = 404;
            }
        }
    } catch (e) {
        console.log(e);
        res.statusCode = 400;
        res.write(JSON.stringify(e));
    }
    res.end();


}).listen(3000);


//                
