import dotenv from "dotenv";
import { ethers } from "ethers";
import { execSync } from "child_process";

dotenv.config();

// --- Helper: Make addresses look short (e.g. 0x123...abc) ---
const shorten = (str) => str ? `${str.slice(0, 6)}...${str.slice(-4)}` : "Unknown";

// --- Config ---
const ethProvider = new ethers.JsonRpcProvider("http://localhost:8545");
// Note: We use the Private Key to sign, but we never log it!
const ethWallet = new ethers.Wallet(process.env.ETH_PRIVATE_KEY, ethProvider);
const abi = ["function mint(address to, uint256 amount)"];

// --- Eth -> Sui ---
export async function bridgeEthToSui(req, res) {
  try {
    const amount = req.body.amount || "100";
    const recipient = req.body.suiAddress || process.env.SUI_RECIPIENT;

    console.log(`\n=======================================`);
    console.log(`🌉 BRIDGE REQUEST: ETH ➡️  SUI`);
    console.log(`💰 Amount:   ${amount} IBT`);
    console.log(`👤 To User:  ${shorten(recipient)}`);
    console.log(`⚙️  Status:   Minting on Sui...`);

    // execute Sui CLI command (Silent unless error)
    execSync(
      `sui client call --package ${process.env.SUI_PACKAGE_ID} --module ibt --function mint --args ${process.env.SUI_TREASURY_CAP} ${amount} ${recipient} --gas-budget 10000000`
    );

    console.log(`✅ SUCCESS:  Tokens minted on Sui!`);
    console.log(`=======================================\n`);

    res.json({ status: "success", chain: "sui", recipient, amount });
  } catch (err) {
    console.error(`❌ ERROR: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
}

// --- Sui -> Eth ---
export async function bridgeSuiToEth(req, res) {
  try {
    const amount = req.body.amount || "100";
    const recipient = req.body.ethAddress || process.env.ETH_RECIPIENT;

    console.log(`\n=======================================`);
    console.log(`🌉 BRIDGE REQUEST: SUI ➡️  ETH`);
    console.log(`💰 Amount:   ${amount} IBT`);
    console.log(`👤 To User:  ${shorten(recipient)}`);
    console.log(`⚙️  Status:   Minting on Ethereum...`);

    const contract = new ethers.Contract(process.env.ETH_CONTRACT, abi, ethWallet);
    const tx = await contract.mint(recipient, amount);
    
    console.log(`⏳ Pending:  Waiting for confirmation...`);
    await tx.wait();

    console.log(`✅ SUCCESS:  Tokens minted on Eth!`);
    console.log(`🔗 Tx Hash:  ${shorten(tx.hash)}`);
    console.log(`=======================================\n`);

    res.json({ status: "success", chain: "eth", hash: tx.hash, recipient, amount });
  } catch (err) {
    console.error(`❌ ERROR: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
}