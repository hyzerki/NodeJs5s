async function getRecordsByField(object, field, context) {
    const fields = {};
    fields[object] = field;
    let records = [];
    if (field) {
        records = await context.getOne(object, fields);
    } else {
        records = await context.getAll(object);
    }
    return records;
}

async function mutateRecord(object, idField, fields, context) {
    console.log(fields);
    let fie = {[object]: idField};
    return await context.getOne(object, fie)
        .then(async records => {
            let targetRecord = {};
            if (records.length > 0) {
                targetRecord = await context.updateOne(object, fields)
                    .then(() => context.getOne(object, fields));
            } else {
                //delete fields[Object.keys(fields).find(field => fields[field] === idField)];
                targetRecord = await context.insertOne(object, fields)
                    .then(() => context.getOne(object, fields));
            }
            return targetRecord[0];
        });
}

async function deleteRecord(object, id, context) {
    let recordIdObject = {};
    recordIdObject[object] = id;
    let targetFaculty = await context.getOne(object, recordIdObject);
    context.deleteOne(object, id);
    if (targetFaculty[0] === undefined) {
        return false
    } else {
        return true
    }

}


module.exports =
    {
        getFaculties: (args, context) => getRecordsByField('FACULTY', args.FACULTY, context),
        getPulpits: (args, context) => getRecordsByField('PULPIT', args.PULPIT, context),
        getSubjects: (args, context) => getRecordsByField('SUBJECT', args.SUBJECT, context),
        getTeachers: (args, context) => getRecordsByField('TEACHER', args.TEACHER, context),
        getSubjectsByFaculties: async (args, context) => {
            const {SUBJECT, FACULTY} = args;
            console.log(FACULTY);
            return FACULTY ?
                await context.query(
                    `SELECT SUBJECT.SUBJECT,SUBJECT.SUBJECT_NAME,SUBJECT.PULPIT FROM SUBJECT join PULPIT on SUBJECT.PULPIT = PULPIT.PULPIT join FACULTY on PULPIT.FACULTY = FACULTY.FACULTY where FACULTY.FACULTY ='${FACULTY}';`
                ) : await getRecordsByField('SUBJECT', SUBJECT, context);
        },
        getTeachersByFaculty: async (args, context) => {
            const {TEACHER, FACULTY} = args;
            console.log(FACULTY);
            return FACULTY ?
                await context.query(
                    `SELECT TEACHER.TEACHER, TEACHER.TEACHER_NAME, TEACHER.PULPIT FROM TEACHER join PULPIT on TEACHER.PULPIT = PULPIT.PULPIT join FACULTY on PULPIT.FACULTY = FACULTY.FACULTY where FACULTY.FACULTY ='${FACULTY}';`
                ) : await getRecordsByField('TEACHER', TEACHER, context);
        },
        setFaculty: (args, context) => {
            let fields = {FACULTY: args.FACULTY, FACULTY_NAME: args.FACULTY_NAME};
            return mutateRecord('FACULTY', fields.FACULTY, fields, context);
        },
        setPulpit: async (args, context) => {
            let fields = {PULPIT: args.PULPIT, PULPIT_NAME: args.PULPIT_NAME, FACULTY: args.FACULTY};
            return mutateRecord('PULPIT', fields.PULPIT, fields, context);
        },
        setSubject: async (args, context) => {
            let fields = {SUBJECT: args.SUBJECT, SUBJECT_NAME: args.SUBJECT_NAME, PULPIT: args.PULPIT};
            return mutateRecord('SUBJECT', fields.SUBJECT, fields, context);
        },
        setTeacher: async (args, context) => {
            let fields = {TEACHER: args.TEACHER, TEACHER_NAME: args.TEACHER_NAME, PULPIT: args.PULPIT};
            return mutateRecord('TEACHER', fields.TEACHER, fields, context);
        },

        delFaculty: (args, context) => deleteRecord('FACULTY', args.FACULTY, context),
        delPulpit: (args, context) => deleteRecord('PULPIT', args.PULPIT, context),
        delSubject: (args, context) => deleteRecord('SUBJECT', args.SUBJECT, context),
        delTeacher: (args, context) => deleteRecord('TEACHER', args.TEACHER, context)
    };