import fs from "fs";
import http from "http";
import * as Sequelize from "sequelize";
import { Model, Op } from "sequelize";
import url from "url";


const sequelize = new Sequelize.Sequelize("node_14", "node_14", "node14enjoyer", {
    dialect: "mssql",
    host: "localhost",
    port: "1433",
    pool: {
        min: 5,
        max: 10
    },
    define: {
        hooks: {
            beforeDestroy() {
                console.log("beforeDestroy hook string 15")
            }
        }
    }
});


class Faculty extends Model {
};

class Pulpit extends Model {
};

class Teacher extends Model {
};

class Subject extends Model {
};

class Auditorium_type extends Model {
};

class Auditorium extends Model {
};

Faculty.init(
    {
        faculty: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
        faculty_name: { type: Sequelize.STRING, allowNull: false }
    },
    {
        sequelize,
        modelName: 'Faculty',
        tableName: 'FACULTY',
        timestamps: false
    }
);
Faculty.addHook('beforeCreate', () => {
    console.warn('Before Faculty create')
})
Faculty.addHook('afterCreate', () => {
    console.warn('After Faculty create')
})
Pulpit.init(
    {
        pulpit: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
        pulpit_name: { type: Sequelize.STRING, allowNull: false },
        faculty: {
            type: Sequelize.STRING, allowNull: false,
            references: { model: Faculty, key: 'faculty' }
        }
    },
    {
        sequelize,
        modelName: 'Pulpit',
        tableName: 'PULPIT',
        timestamps: false
    }
);
Teacher.init(
    {
        teacher: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
        teacher_name: { type: Sequelize.STRING, allowNull: false },
        pulpit: {
            type: Sequelize.STRING, allowNull: false,
            references: { model: Pulpit, key: 'pulpit' }
        }
    },
    {
        sequelize,
        modelName: 'Teacher',
        tableName: 'TEACHER',
        timestamps: false
    }
);
Subject.init(
    {
        subject: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
        subject_name: { type: Sequelize.STRING, allowNull: false },
        pulpit: {
            type: Sequelize.STRING, allowNull: false,
            references: { model: Pulpit, key: 'pulpit' }
        }
    },
    {
        sequelize,
        modelName: 'Subject',
        tableName: 'SUBJECT',
        timestamps: false
    }
);

Auditorium_type.init(
    {
        auditorium_type: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
        auditorium_typename: { type: Sequelize.STRING, allowNull: false },
    },
    {
        sequelize,
        modelName: 'Auditorium_type',
        tableName: 'AUDITORIUM_TYPE',
        timestamps: false
    }
);

Auditorium.init(
    {
        auditorium: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
        auditorium_name: { type: Sequelize.STRING, allowNull: false },
        auditorium_capacity: { type: Sequelize.INTEGER, allowNull: false },
        auditorium_type: {
            type: Sequelize.STRING, allowNull: false,
            references: { model: Auditorium_type, key: 'auditorium_type' }
        }
    },
    {
        sequelize,
        modelName: 'Auditorium',
        tableName: 'AUDITORIUM',
        timestamps: false
    }
);

Auditorium.addScope('auditoriumsgt60', {
    where: {
        auditorium_capacity: {
            [Op.between]: [10, 60]
        }
    }
})

Faculty.hasMany(Pulpit, { foreignKey: "faculty" });
Pulpit.hasMany(Teacher, { foreignKey: "pulpit" });
Pulpit.hasMany(Subject, { foreignKey: "pulpit" });
Auditorium_type.hasMany(Auditorium, { foreignKey: "auditorium_type" });

try {
    let syncResult = await sequelize.sync();
    console.log(syncResult);

} catch (e) {
    console.log(e);
    process.exit(-1);
}

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
    console.log(new RegExp(/^\/api\/faculties\/\S+\/subjects$/).test(dUrl.path));
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    try {
        if (req.method === "GET") {
            if (dUrl.path === "/") {
                res.setHeader("Content-Type", "text/html; charset=utf-8");
                fs.createReadStream("./index.html").pipe(res);
                return;
            } else if (dUrl.path === "/api/transaction") {
                let result = await sequelize.transaction(async (tran) => {
                    await Faculty.create({ faculty: "QWE", faculty_name: "QWE" }, { transaction: tran });
                    await Faculty.create({ faculty: "ZXC", faculty_name: "ZXC" }, { transaction: tran });
                    return "Кайфарики";
                });
                res.write(JSON.stringify(result));
            } else if (dUrl.path === "/api/faculties") {
                res.write(JSON.stringify(await Faculty.findAll({ raw: true })));
            } else if (dUrl.path === "/api/pulpits") {
                res.write(JSON.stringify(await Pulpit.findAll({ raw: true })));
            } else if (dUrl.path === "/api/subjects") {
                res.write(JSON.stringify(await Subject.findAll({ raw: true })));
            } else if (dUrl.path === "/api/teachers") {
                res.write(JSON.stringify(await Teacher.findAll({ raw: true })));
            } else if (dUrl.path === "/api/auditoriumtypes") {
                res.write(JSON.stringify(await Auditorium_type.findAll({ raw: true })));
            } else if (dUrl.path === "/api/auditoriums") {
                res.write(JSON.stringify(await Auditorium.findAll({ raw: true })));
            } else if (dUrl.path === "/api/auditoriums/scoped") {
                res.write(JSON.stringify(await Auditorium.scope("auditoriumsgt60").findAll()));
            } else if (new RegExp(/^\/api\/faculties\/\S+\/subjects$/).test(dUrl.path)) {
                res.write(JSON.stringify(await Faculty.findOne({ where: { faculty: pathParts[3] }, include: [{ model: Pulpit, include: [{ model: Subject }] }] })));
            } else if (new RegExp(/^\/api\/auditoriumtypes\/\S+\/auditoriums$/).test(dUrl.path)) {
                res.write(JSON.stringify(await Auditorium.findAll({ where: { auditorium_type: pathParts[3] } })));
            } else {
                res.statusCode = 404;
            }
        } else if (req.method === "POST" && bodyObject !== null) {
            if (dUrl.path === "/api/faculties") {
                res.write(JSON.stringify(await Faculty.create(bodyObject)));
            } else if (dUrl.path === "/api/pulpits") {
                res.write(JSON.stringify(await Pulpit.create(bodyObject)));
            } else if (dUrl.path === "/api/subjects") {
                res.write(JSON.stringify(await Subject.create(bodyObject)));
            } else if (dUrl.path === "/api/teachers") {
                res.write(JSON.stringify(await Teacher.create(bodyObject)));
            } else if (dUrl.path === "/api/auditoriumtypes") {
                res.write(JSON.stringify(await Auditorium_type.create(bodyObject)));
            } else if (dUrl.path === "/api/auditoriums") {
                res.write(JSON.stringify(await Auditorium.create(bodyObject)));
            } else {
                res.statusCode = 404;
            }
        } else if (req.method === "PUT" && bodyObject !== null) {
            if (dUrl.path === "/api/faculties") {
                res.write(JSON.stringify(await Faculty.update(bodyObject, { where: { faculty: bodyObject.faculty } })));
            } else if (dUrl.path === "/api/pulpits") {
                res.write(JSON.stringify(await Pulpit.update(bodyObject, { where: { pulpit: bodyObject.pulpit } })));
            } else if (dUrl.path === "/api/subjects") {
                res.write(JSON.stringify(await Subject.update(bodyObject, { where: { subject: bodyObject.subject } })));
            } else if (dUrl.path === "/api/teachers") {
                res.write(JSON.stringify(await Teacher.update(bodyObject, { where: { teacher: bodyObject.teacher } })));
            } else if (dUrl.path === "/api/auditoriumtypes") {
                res.write(JSON.stringify(await Auditorium_type.update(bodyObject, { where: { auditorium_type: bodyObject.auditorium_type } })));
            } else if (dUrl.path === "/api/auditoriums") {
                res.write(JSON.stringify(await Auditorium.update(bodyObject, { where: { faculty: bodyObject.faculty } })));
            } else {
                res.statusCode = 404;
            }
        } else if (req.method === "DELETE") {
            if (dUrl.path === "/api/faculties") {
                res.write(JSON.stringify(await Faculty.destroy({ where: { faculty: bodyObject.faculty } })));
            } else if (dUrl.path === "/api/pulpits") {
                res.write(JSON.stringify(await Pulpit.destroy({ where: { pulpit: bodyObject.pulpit } })));
            } else if (dUrl.path === "/api/subjects") {
                res.write(JSON.stringify(await Subject.destroy({ where: { subject: bodyObject.subject } })));
            } else if (dUrl.path === "/api/teachers") {
                res.write(JSON.stringify(await Teacher.destroy({ where: { teacher: bodyObject.teacher } })));
            } else if (dUrl.path === "/api/auditoriumtypes") {
                res.write(JSON.stringify(await Auditorium_type.destroy({ where: { auditorium_type: bodyObject.auditorium_type } })));
            } else if (dUrl.path === "/api/auditoriums") {
                res.write(JSON.stringify(await Auditorium.destroy({ where: { faculty: bodyObject.faculty } })));
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

// Зашифроватт и расшифровать совю фамилию на произвольном языке используя афинный шифр цезаря и шифр вижинера в шфре виженера возьмите своё имя в качестве ключа