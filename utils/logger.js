class Logger {
    static PRINT_INFO = true;
    static PRINT_ERROR = true;

    constructor() {}

    static i(msg) {
        i("", msg);
    }

    static i(tag, msg) {
        if (Logger.PRINT_INFO) {
            //if (tag) console.log(tag);
            console.log(msg);
        }
    }

    static e(msg) {
        e("", msg);
    }

    static e(tag, msg) {
        if (Logger.PRINT_ERROR) {
            console.log("ERROR");
            //if (tag) console.log(tag);
            console.log(msg);
        }
    }
}

module.exports.Logger = Logger;