class User {
    id = -1;
    name = undefined;
    bday = new Date();
    constructor(name, bday) {
        this.name = name;
        this.bday = bday;
    }
}

module.exports = User;