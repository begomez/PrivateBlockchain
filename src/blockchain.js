/**
 *                          Blockchain Class
 *  The Blockchain class contain the basics functions to create your own private blockchain
 *  It uses libraries like `crypto-js` to create the hashes for each block and `bitcoinjs-message` 
 *  to verify a message signature. The chain is stored in the array
 *  `this.chain = [];`. Of course each time you run the application the chain will be empty because and array
 *  isn't a persisten storage method.
 *  
 */

const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./block.js');
const Logger = require('../utils/logger.js');
const bitcoinMessage = require('bitcoinjs-message');
const hex2ascii = require('hex2ascii');

class Blockchain {

    /**
     * Constructor of the class, you will need to setup your chain array and the height
     * of your chain (the length of your chain array).
     * Also everytime you create a Blockchain class you will need to initialized the chain creating
     * the Genesis Block.
     * The methods in this class will always return a Promise to allow client applications or
     * other backends to call asynchronous functions.
     */
    constructor() {
        this.chain = [];
        this.height = -1;
        this._initializeChain();
    }

    /**
     * This method will check for the height of the chain and if there isn't a Genesis Block it will create it.
     * You should use the `addBlock(block)` to create the Genesis Block
     * Passing as a data `{data: 'Genesis Block'}`
     */
    async _initializeChain() {
        if( this.height === -1){
            let block = new BlockClass.Block({data: 'Genesis Block'});

            await this._addBlock(block);
        }
    }

    /**
     * Utility method that return a Promise that will resolve with the height of the chain
     */
    getChainHeight() {
        return new Promise((resolve, reject) => {
            resolve(this.height);
        });
    }

    /**
     * _addBlock(block) will store a block in the chain
     * @param {*} block 
     * The method will return a Promise that will resolve with the block added
     * or reject if an error happen during the execution.
     * You will need to check for the height to assign the `previousBlockHash`,
     * assign the `timestamp` and the correct `height`...At the end you need to 
     * create the `block hash` and push the block into the chain array. Don't for get 
     * to update the `this.height`
     * Note: the symbol `_` in the method name indicates in the javascript convention 
     * that this method is a private method. 
     */
    _addBlock(block) {
        let self = this;

        return new Promise(async (resolve, reject) => {
            Logger.Logger.i("_addBlock():", block.toString());

            try {
                let numBlocks = self.chain.length;
            
            // assign props
                block.height = numBlocks;
                block.time = new Date().getTime().toString().slice(0, -3);
    
                if (self._isEmpty(numBlocks)) {
                    block.previousBlockHash = null;
    
                } else {
                    block.previousBlockHash = self.chain[numBlocks - 1].hash;
                }
    
                block.hash = SHA256(JSON.stringify(block)).toString();

                // add to array
                self.chain.push(block);

                //XXX: always validate chain after adding...
                await self.validateChain();

                resolve(block);

            } catch (e) {
                reject(`Error while adding block with hash:"${block.hash}". Please try again`)
                    //.catch(error => { Logger.Logger.e(error); })
                    ;
            }
        });
    }

    _isEmpty(size) {
        return (size == 0);
    }

    /**
     * The requestMessageOwnershipVerification(address) method
     * will allow you  to request a message that you will use to
     * sign it with your Bitcoin Wallet (Electrum or Bitcoin Core)
     * This is the first step before submit your Block.
     * The method return a Promise that will resolve with the message to be signed
     * @param {*} address 
     */
    requestMessageOwnershipVerification(address) {
        return new Promise((resolve, reject) => {
            Logger.Logger.i("requestMessageOwnershipVerification()", address);

            const TEMPLATE = "<<WALLET_ADDRESS>>:<<NOW>>:starRegistry";

            let msg = TEMPLATE.replace("<<WALLET_ADDRESS>>", address);

            msg = msg.replace("<<NOW>>", new Date().getTime().toString().slice(0, -3));

            resolve(msg);
        });
    }

    /**
     * The submitStar(address, message, signature, star) method
     * will allow users to register a new Block with the star object
     * into the chain. This method will resolve with the Block added or
     * reject with an error.
     * Algorithm steps:
     * 1. Get the time from the message sent as a parameter example: `parseInt(message.split(':')[1])`
     * 2. Get the current time: `let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));`
     * 3. Check if the time elapsed is less than 5 minutes
     * 4. Verify the message with wallet address and signature: `bitcoinMessage.verify(message, address, signature)`
     * 5. Create the block and add it to the chain
     * 6. Resolve with the block added.
     * @param {*} address 
     * @param {*} message 
     * @param {*} signature 
     * @param {*} star 
     */
    submitStar(address, message, signature, star) {
        Logger.Logger.i("submitStar()", "address: " + address + "\n" + "msg:" + message + "\n" + "sign:" + signature + "\n" + "star:" + star);

        let self = this;

        return new Promise(async (resolve, reject) => {
            const SEP = ":";
            const VALID_THRESHOLD = 5 * 60 * 1;// 5 mins * 60 secs/min, working with secs instead of milis

            let nowTime = parseInt(new Date().getTime().toString().slice(0, -3));
            let recTime = parseInt(message.split(SEP)[1]);

            // VALID
            if ((nowTime - recTime) <= VALID_THRESHOLD) {

                // verify
                bitcoinMessage.verify(message, address, signature);

                // create block
                let block = new BlockClass.Block(
                    //XXX: create as a whole json obj
                    {
                        "address" : address,
                        "message" : message,
                        "star" : star,
                        "signature" : signature
                    }
                );

                // add to chain
                self._addBlock(block);

                resolve(block);

            // INVALID
            } else {
                reject(`Submitted star expired at: ${recTime}`)
                    //.catch(error => { Logger.Logger.e(error); })
                    ;
            }
        });
    }

    /**
     * This method will return a Promise that will resolve with the Block
     *  with the hash passed as a parameter.
     * Search on the chain array for the block that has the hash.
     * @param {*} hash 
     */
    getBlockByHash(hash) {
        let self = this;

        return new Promise((resolve, reject) => {
            Logger.Logger.i("getBlockByHash()", hash);

           if (self.chain.isEmpty) {
                resolve("Error while searching blocks by hash, chain is empty!");

           } else {
                let target = self.chain.filter((block) => block.hash == hash);

                if (target) {
                    resolve(target);

                } else {
                    reject(`Target block with hash ${hash} not found`)
                        //.catch(error => { Logger.Logger.e(error); })
                        ;
                }
            }
        });
    }

    /**
     * This method will return a Promise that will resolve with the Block object 
     * with the height equal to the parameter `height`
     * @param {*} height 
     */
    getBlockByHeight(height) {
        let self = this;

        return new Promise((resolve, reject) => {
            Logger.Logger.i("getBlockByHeight()", height);

            let block = self.chain.filter(p => p.height === height)[0];

            if (block){
                resolve(block);
            
            } else {
                resolve(null);
            }
        });
    }

    /**
     * This method will return a Promise that will resolve with an array of Stars objects existing in the chain 
     * and are belongs to the owner with the wallet address passed as parameter.
     * Remember the star should be returned decoded.
     * @param {*} address 
     */
    getStarsByWalletAddress(address) {
        Logger.Logger.i("getStarsByWalletAddress()", address);

        let self = this;
        let stars = [];

        return new Promise(async (resolve, reject) => {
            if (this.chain.isEmpty) {
                reject("Error while searching stars by address, chain is empty!")
                    .catch(error => { Logger.Logger.e(error); });

            } else {
                for (var i = 1; i < self.chain.length; i++) {
                    var currentBlock = self.chain[i];

                    var currentStar = await currentBlock.getBData().then((data) => { 
                        Logger.Logger.i("retrieved data: " + data);
                        if (data.address == address) {
                            stars.push(data);
                        }
                    });
                }

                if (stars.isEmpty) {
                    reject(`No stars found for address ${address}`)
                        //.catch(error => { Logger.Logger.e(error); })
                        ;

                } else {
                    resolve(stars);
                }

            }
        });
    }

    /**
     * This method will return a Promise that will resolve with the list of errors when validating the chain.
     * Steps to validate:
     * 1. You should validate each block using `validateBlock`
     * 2. Each Block should check the with the previousBlockHash
     */
    validateChain() {
        let self = this;
        let errorLog = [];

        return new Promise(async (resolve, reject) => {
            
            if (self.chain.isEmpty) {
                reject("Error while validating, chain is empty!")
                    .catch(error => {Logger.Logger.e(error); });

            } else {
                for (var i = 0; i < self.chain.length; i++) {
                    var currentBlock = self.chain[i];

                    // (INNER) BLOCK VALIDATION
                    var currentValid = await currentBlock.validate();

                    // (OUTER) CHAIN VALIDATION
                    if (currentValid) {

                        // OTHER THAN GENESIS...
                        if (currentBlock.height > 0) {
                            var j = i - 1;
                            if (currentBlock.previousBlockHash != self.chain[j].hash) {
                                errors.push(`Invalid PREVIOUS block for block with height: ${currentBlock.height}`);
                            }
                        }

                    } else {
                        errors.push(`Inconsistent block at position ${currentBlock.height}`);
                    }
                }

                resolve(errorLog);
            }
        });
    }

}

module.exports.Blockchain = Blockchain;   