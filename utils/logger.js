class Logger {
    
    constructor() {
        
    }

    i(msg) {
        this.i("", msg);
    }

    i(tag, msg) {
        console.log(tag + " " + msg);
    }

    e(msg) {
        console.log("ERROR: " + msg);
    }
}

module.exports.Logger = Logger;