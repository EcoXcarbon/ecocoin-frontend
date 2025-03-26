import React, { useState } from "react";
import { ethers } from "ethers";
import EcoFaucet from "../artifacts/contracts/EcoFaucet.sol/EcoFaucet.json";
const FAUCET_ADDRESS = "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c";; // update if changed

const Faucet = ({ provider, signer }) => {
  const [status, setStatus] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);

  const handleClaim = async () => {
    if (!signer || !provider) {
      setStatus("❌ Wallet not connected.");
      return;
    }

    try {
      setIsClaiming(true);
      setStatus("⏳ Claiming tokens...");

      const faucet = new ethers.Contract(FAUCET_ADDRESS, EcoFaucet.abi, signer);
      const tx = await faucet.claim();

      console.log("📨 Tx sent:", tx.hash);
      setStatus("⏳ Waiting for confirmation...");

      await provider.waitForTransaction(tx.hash);
      setStatus("✅ Claim successful! 50 ECO sent.");
    } catch (err) {
      console.error("❌ Claim error:", err);
      if (err.message.includes("already claimed")) {
        setStatus("❌ Already claimed from this wallet.");
      } else {
        setStatus("❌ Claim failed. See console.");
      }
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl max-w-md mx-auto mt-10 text-center">
      <h2 className="text-2xl font-bold text-green-700 mb-2">🌱 EcoCoin Faucet</h2>
      <p className="mb-4 text-gray-600">Claim 50 test ECO tokens to your MetaMask wallet.</p>
      <button
        onClick={handleClaim}
        disabled={isClaiming}
        className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-xl transition-all ${
          isClaiming ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        💧 {isClaiming ? "Claiming..." : "Claim 50 ECO"}
      </button>
      {status && <p className="mt-4 text-sm text-gray-800">{status}</p>}
    </div>
  );
};

export default Faucet;
