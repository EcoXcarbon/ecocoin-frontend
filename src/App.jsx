import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Faucet from "./components/Faucet";
import Staking from "./components/Staking"; // ✅ NEW: Staking import

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState("");

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        console.log("🟢 MetaMask detected");

        const webProvider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const webSigner = await webProvider.getSigner();
        const userAddress = await webSigner.getAddress();

        console.log("✅ Connected:", userAddress);

        setProvider(webProvider);
        setSigner(webSigner);
        setAddress(userAddress);
      } else {
        alert("Please install MetaMask to use EcoCoin!");
      }
    } catch (err) {
      console.error("❌ Wallet connection error:", err);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) connectWallet();
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-green-50 text-center p-6">
      <h1 className="text-3xl font-bold text-green-800 mb-4">EcoCoin Faucet</h1>

      {!address ? (
        <button
          onClick={connectWallet}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-xl shadow mb-4"
        >
          🔌 Connect Wallet
        </button>
      ) : (
        <p className="text-gray-700 mb-4">Connected: {address}</p>
      )}

      <Faucet provider={provider} signer={signer} />

      {/* ✅ NEW: Show staking only when wallet connected */}
      {address && (
        <Staking provider={provider} signer={signer} address={address} />
      )}
    </div>
  );
}

export default App;
