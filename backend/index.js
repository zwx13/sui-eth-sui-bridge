import express from "express";
import bodyParser from "body-parser";
import { bridgeEthToSui, bridgeSuiToEth } from "./bridge.js";

const app = express();
app.use(bodyParser.json());

// Connect the URLs to the functions imported above
app.post("/eth-to-sui", bridgeEthToSui);
app.post("/sui-to-eth", bridgeSuiToEth);

// Listen on Port 3001
app.listen(3001, () => {
  console.log("Bridge backend running on port 3001");
});