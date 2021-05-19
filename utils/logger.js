class Logger {
    
    constructor() {
        
    }

    i(msg) {
        this.i("", msg);
    }

    i(tag, msg) {
        console.log(tag);
        console.log(msg);
    }

    e(msg) {
        this.e("", msg);
    }

    e(tag, msg) {
        console.log("ERROR");
        console.log(tag);
        console.log(msg);
    }
}

module.exports.Logger = Logger;