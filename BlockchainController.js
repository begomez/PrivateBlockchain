/**
 *          BlockchainController
 *       (Do not change this code)
 * 
 * This class expose the endpoints that the client applications will use to interact with the 
 * Blockchain dataset
 */
class BlockchainController {

    //The constructor receive the instance of the express.js app and the Blockchain class
    constructor(app, blockchainObj) {
        this.app = app;
        this.blockchain = blockchainObj;

        this.initRoutes();
    }

    // All the endpoints methods needs to be called in the constructor to initialize the route.
    initRoutes() {    
        this.getBlockByHeight();
        this.requestOwnership();
        this.submitStar();
        this.getBlockByHash();
        this.getStarsByOwner();
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
                    return res.status(200).json(block);

                // INVALID BLOCK
                } else {
                    return res.status(404).send("Block Not Found!");
                }

            // INVALID REQ
            } else {
                return res.status(404).send("Block Not Found! Review the Parameters!");
            }
            
        });
    }

    // Endpoint that allows user to request Ownership of a Wallet address (POST Endpoint)
    requestOwnership() {
        this.app.post("/requestValidation", async (req, res) => {

            // VALID PARAM
            if (req.body.address) {
                const targetAddress = req.body.address;
                const message = await this.blockchain.requestMessageOwnershipVerification(targetAddress);

                // MSG
                if (message){
                    return res.status(200).json(message);

                // ERROR
                } else {
                    return res.status(500).send("An error happened!");
                }

            // INVALID PARAM
            } else {
                return res.status(500).send("Check the Body Parameter!");
            }
        });
    }

    // Endpoint that allow Submit a Star, you need first to `requestOwnership` to have the message (POST endpoint)
    submitStar() {
        this.app.post("/submitstar", async (req, res) => {

            // VALID PARAMS
            if (req.body.address && req.body.message && req.body.signature && req.body.star) {
                const targetAddress = req.body.address;
                const targetMessage = req.body.message;
                const targetSignature = req.body.signature;
                const targetStar = req.body.star;

                try {
                    let block = await this.blockchain.submitStar(targetAddress, targetMessage, targetSignature, targetStar);
                    
                    // DATA RETRIEVED
                    if (block){
                        return res.status(200).json(block);

                    // ERROR   
                    } else {
                        return res.status(500).send("An error happened!");
                    }

                } catch (error) {
                    return res.status(500).send(error);
                }

            // INVALID PARAMS
            } else {
                return res.status(500).send("Check the Body Parameter!");
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
                    return res.status(200).json(block);

                // ERROR
                } else {
                    return res.status(404).send("Block Not Found!");
                }

            // INVALID PARAMS
            } else {
                return res.status(404).send("Block Not Found! Review the Parameters!");
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
                        return res.status(200).json(stars);
                    
                    // ERROR
                    } else {
                        return res.status(404).send("Block Not Found!");
                    }

                } catch (error) {
                    return res.status(500).send("An error happened!");
                }

            // INVALID PARAMS
            } else {
                return res.status(500).send("Block Not Found! Review the Parameters!");
            }
        
        });
    }

}

module.exports = (app, blockchainObj) => { return new BlockchainController(app, blockchainObj);}