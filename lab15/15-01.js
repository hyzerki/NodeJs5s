const http = require("http");
const url = require("url");
const {MongoClient} = require("mongodb");

let mongoClient = new MongoClient("mongodb://127.0.0.1:27017");

connectToDatabase = async function (){
    try{
        await mongoClient.connect();
    }catch(e)
    {
        await mongoClient.close();
        console.log(`Не удалось подключиться к бд:\n ${e}`);
        process.exit();
    }
}

connectToDatabase().catch();
console.log('Подключение к бд удалось');

http.createServer(async (req, res)=>{
    try{
        let dUrl = decodeURI(req.url);

        //body init section
        const buffers = []; // буфер для получаемых данных
        for await (const chunk of req) {
            buffers.push(chunk);        // добавляем в буфер все полученные данные
        }
        const data = Buffer.concat(buffers).toString();

        //===============================================================

        if(dUrl.substring(0,14) === '/api/faculties'){
            if(req.method==='GET'){
                if(dUrl.split('/')[3]!==undefined){
                    let wantedFaculty = dUrl.split('/')[3];
                    let faculty = await mongoClient.db("BSTU").collection('faculty').findOne({faculty:wantedFaculty});
                    res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
                    res.end(JSON.stringify(faculty));

                }else{
                    let faculties = await mongoClient.db("BSTU").collection('faculty').find().toArray();
                    res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
                    res.end(JSON.stringify(faculties));
                }

            }else if(req.method==='POST'){
                let faculty = JSON.parse(data);
                await mongoClient.db("BSTU").collection("faculty").insertOne(faculty)
                res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
                res.end(JSON.stringify(faculty));

            }else if(req.method==='PUT'){
                let faculty = JSON.parse(data);
                faculty = await mongoClient.db("BSTU").collection("faculty").findOneAndUpdate({_id : faculty._id},{$set : faculty},{returnDocument: "after"})
                res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
                res.end(JSON.stringify(faculty.value));

            }else if(req.method==='DELETE'){
                if(dUrl.split('/')[3]!==undefined) {
                    let wantedFaculty = dUrl.split('/')[3];
                    let faculty = await mongoClient.db("BSTU").collection('faculty').findOneAndDelete({faculty: wantedFaculty});
                    res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
                    res.end(JSON.stringify(faculty.value));

                }else{
                    res.writeHead(400, {'Content-Type': 'application/json; charset=utf-8'});
                    res.end();
                }
            }
        }

        //==============================================================================================================

        else if(dUrl.substring(0,12) === '/api/pulpits'){
            if(req.method==='GET'){
                if(url.parse(dUrl, true).query.f !== undefined){
                    let wantedFaculties = url.parse(dUrl, true).query.f.split(',');
                    let faculties = await mongoClient.db("BSTU").collection('pulpit').find({faculty:{$in: wantedFaculties}}).toArray();
                    res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
                    res.end(JSON.stringify(faculties));
                    res.end();

                }else if(dUrl.split('/')[3]!==undefined){
                    let wantedPulpit = dUrl.split('/')[3];
                    let pulpit = await mongoClient.db("BSTU").collection('pulpit').findOne({pulpit: wantedPulpit});
                    res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
                    res.end(JSON.stringify(pulpit));

                }else{
                    let pulpits = await mongoClient.db("BSTU").collection('pulpit').find().toArray();
                    res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
                    res.end(JSON.stringify(pulpits));
                }

            }else if(req.method==='POST'){
                let pulpit = JSON.parse(data);
                await mongoClient.db("BSTU").collection("pulpit").insertOne(pulpit);
                res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
                res.end(JSON.stringify(pulpit));

            }else if(req.method==='PUT'){
                let pulpit = JSON.parse(data);
                pulpit = await mongoClient.db("BSTU").collection("pulpit").findOneAndUpdate({_id : pulpit._id},{$set : pulpit},{returnDocument: "after"})
                res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
                res.end(JSON.stringify(pulpit.value));

            }else if(req.method==='DELETE'){
                if(dUrl.split('/')[3]!==undefined) {
                    let wantedPulpit = dUrl.split('/')[3];
                    let pulpit = await mongoClient.db("BSTU").collection('pulpit').findOneAndDelete({pulpit: wantedPulpit});
                    res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
                    res.end(JSON.stringify(pulpit.value));

                }else{
                    res.writeHead(400, {'Content-Type': 'application/json; charset=utf-8'});
                    res.end();
                }
            }

        }else if(dUrl === '/api/transaction' && req.method ==='POST'){
            let session = mongoClient.startSession();

            const transactionOptions = {
                readPreference: 'primary',
                readConcern: { level: 'local' },
                writeConcern: { w: 'majority' }
            };

            try {
                let pulpits = JSON.parse(data);

                session.startTransaction(transactionOptions);
                let result = await mongoClient.db("BSTU").collection('pulpit').insertMany(pulpits,{session});
                await session.commitTransaction();
                res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
                res.end(JSON.stringify(pulpits));
            }
            catch (e) {
                console.log(e.message);
                await session.abortTransaction();
                res.writeHead(400, {'Content-Type': 'application/json; charset=utf-8'});
                res.end(JSON.stringify(e));
            }
            finally {
                await session.endSession();
            }

        }else{
            res.writeHead(404);
            res.end();
        }
    }catch (error) {
        console.log(error);
        res.writeHead(400, {'Content-Type': 'application/json; charset=utf-8'});
        res.end(JSON.stringify(error));
    }
}).listen(3000);