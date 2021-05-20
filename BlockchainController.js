const bodyParser = require("body-parser");

/**
 *          BlockchainController
 *       (Do not change this code)
 * 
 * This class expose the endpoints that the client applications will use to interact with the 
 * Blockchain dataset
 */
class BlockchainController {
    static SUCCESS = 200;
    static ERROR = 404;
    static INTERNAL_ERROR = 500;

    //The constructor receive the instance of the express.js app and the Blockchain class
    constructor(app, blockchainObj) {
        this.app = app;
        this.blockchain = blockchainObj;

        this.initRoutes();
    }

    // All the endpoints methods needs to be called in the constructor to initialize the route.
    initRoutes() {   
        this.validateChain(); 
        this.getBlockByHeight();
        this.requestOwnership();
        this.submitStar();
        this.getBlockByHash();
        this.getStarsByOwner();
    }

    // Endpoint to trigger standalone chain validation
    validateChain() {
        this.app.get("/requestChainValidation", async (req, resp) => {
            let result = await this.blockchain.validateChain();

            if (result) {
                return resp.status(BlockchainController.SUCCESS).json(result);

            } else {
                return resp.status(BlockchainController.INTERNAL_ERROR).send("Chain validation failed");
            }
        });
    }

    // Enpoint to Get a Block by Height (GET Endpoint)
    getBlockByHeight() {
        this.app.get("/block/height/:height", async (req, res) => {

            // VALID REQUEST WITH PARAM
            if (req.params.height) {
                const targetHeight = parseInt(req.params.height);
                let block = await this.blockchain.getBlockByHeight(targetHeight);
                
                // VALID BLOCK
                if (block){
                    return res.status(BlockchainController.SUCCESS).json(block);

                // INVALID BLOCK
                } else {
                    return res.status(BlockchainController.INTERNAL_ERROR).send("Block Not Found By Height!");
                }

            // INVALID REQ
            } else {
                return res.status(BlockchainController.ERROR).send("Block Not Found. Please review parameter:" + req.params.height);
            }
            
        });
    }

    // Endpoint that allows user to request Ownership of a Wallet address (POST Endpoint)
    requestOwnership() {
        this.app.post("/requestValidation", async (req, res) => {

            // VALID REQ
            if (req.body) {
                const targetAddress = req.body.address;
                const message = await this.blockchain.requestMessageOwnershipVerification(targetAddress);

                // MSG
                if (message){
                    return res.status(BlockchainController.SUCCESS).json(message);

                // ERROR
                } else {
                    return res.status(BlockchainController.INTERNAL_ERROR).send("An error happened while requesting ownership!");
                }

            // INVALID REQ
            } else {
                return res.status(BlockchainController.ERROR).send(`Ownership request error! Please review parameter: ${JSON.stringify(req.body.address).toString()}`);
            }
        });
    }

    // Endpoint that allow Submit a Star, you need first to `requestOwnership` to have the message (POST endpoint)
    submitStar() {
        this.app.post("/submitstar", async (req, res) => {

            // VALID REQ
            if (req.body) {
                const targetAddress = req.body.address;
                const targetMessage = req.body.message;
                const targetSignature = req.body.signature;
                const targetStar = req.body.star;

                try {

                    // VALID PARAMS
                    if (targetAddress && targetMessage && targetSignature && targetStar) {
                        let block = await this.blockchain.submitStar(targetAddress, targetMessage, targetSignature, targetStar);
                        
                        // DATA RETRIEVED
                        if (block){
                            return res.status(BlockchainController.SUCCESS).json(block);

                        // ERROR   
                        } else {
                            return res.status(BlockchainController.INTERNAL_ERROR).send("An error happened while submitting the star!");
                        } 

                    // INVALID
                    } else {
                        return res.status(BlockchainController.ERROR).send(`Submission error! Please review parameter: ${JSON.stringify(req.body).toString()}`); 
                    }

                } catch (error) {
                    return res.status(BlockchainController.INTERNAL_ERROR).send("catch " + error);
                }

            // INVALID REQ
            } else {
                return res.status(BlockchainController.ERROR).send(`Submission error! Please review parameter: ${JSON.stringify(req.body).toString()}`);
            }
        });
    }

    // This endpoint allows you to retrieve the block by hash (GET endpoint)
    getBlockByHash() {
        this.app.get("/block/hash/:hash", async (req, res) => {

            // VALID PARAMS
            if (req.params.hash) {
                const targetHash = req.params.hash;
                let block = await this.blockchain.getBlockByHash(targetHash);

                // DATA
                if (block){
                    return res.status(BlockchainController.SUCCESS).json(block);

                // ERROR
                } else {
                    return res.status(BlockchainController.INTERNAL_ERROR).send("Block Not Found By Hash!");
                }

            // INVALID PARAMS
            } else {
                return res.status(BlockchainController.ERROR).send("Block Not Found! Please review parameter: " + req.params.hash);
            }
        
        });
    }

    // This endpoint allows you to request the list of Stars registered by an owner
    getStarsByOwner() {
        this.app.get("/blocks/:address", async (req, res) => {

            // VALID PARAMS
            if (req.params.address) {
                const targetAddress = req.params.address;

                try {
                    let stars = await this.blockchain.getStarsByWalletAddress(targetAddress);
                
                    // DATA
                    if (stars){
                        return res.status(BlockchainController.SUCCESS).json(stars);
                    
                    // ERROR
                    } else {
                        return res.status(BlockchainController.INTERNAL_ERROR).send("Block Not Found By Address!");
                    }

                } catch (error) {
                    return res.status(BlockchainController.INTERNAL_ERROR).send("An error happened!");
                }

            // INVALID PARAMS
            } else {
                return res.status(BlockchainController.ERROR).send("Block Not Found! Please review parameter: " + req.params.address);
            }
        
        });
    }

}

module.exports = (app, blockchainObj) => { return new BlockchainController(app, blockchainObj);}