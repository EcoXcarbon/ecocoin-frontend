import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import EcoCoin from "../abi/EcoCoin.json";
import EcoStaker from "../abi/EcoStaker.json";

const EcoCoinABI = EcoCoin.abi;
const StakerABI = EcoStaker.abi;

const TOKEN_ADDRESS = import.meta.env.VITE_ECOCOIN_ADDRESS;
const STAKER_ADDRESS = import.meta.env.VITE_STAKER_ADDRESS;

function Staking({ signer, address }) {
  const [balance, setBalance] = useState("0");
  const [staked, setStaked] = useState("0");
  const [status, setStatus] = useState("");

  const loadBalances = async () => {
    try {
      const token = new ethers.Contract(TOKEN_ADDRESS, EcoCoinABI, signer);
      const staker = new ethers.Contract(STAKER_ADDRESS, StakerABI, signer);

      const rawBalance = await token.balanceOf(address);
      const [rawStaked] = await staker.getStakeInfo(address); // ✅ Correct ABI usage

      setBalance(ethers.formatUnits(rawBalance, 18));
      setStaked(ethers.formatUnits(rawStaked, 18));
    } catch (err) {
      console.error("❌ Failed to load balances:", err);
    }
  };

  const handleStake = async () => {
    try {
      setStatus("⏳ Approving & staking...");
      const token = new ethers.Contract(TOKEN_ADDRESS, EcoCoinABI, signer);
      const staker = new ethers.Contract(STAKER_ADDRESS, StakerABI, signer);

      const amount = ethers.parseUnits("50", 18);
      const tx1 = await token.approve(STAKER_ADDRESS, amount);
      await tx1.wait();

      const tx2 = await staker.stake(amount);
      await tx2.wait();

      setStatus("✅ Staked 50 ECO!");
      loadBalances();
    } catch (err) {
      console.error("❌ Staking failed:", err);
      setStatus("❌ Staking failed");
    }
  };

  const handleUnstake = async () => {
    try {
      setStatus("⏳ Unstaking...");
      const staker = new ethers.Contract(STAKER_ADDRESS, StakerABI, signer);
      const tx = await staker.unstake();
      await tx.wait();

      setStatus("✅ Unstaked successfully!");
      loadBalances();
    } catch (err) {
      console.error("❌ Unstaking failed:", err);
      setStatus("❌ Unstaking failed");
    }
  };

  useEffect(() => {
    if (signer && address) {
      loadBalances();
    }
  }, [signer, address]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold text-green-700 mb-2">🌳 Staking Panel</h2>
      <p className="mb-2 text-gray-700">Your ECO Balance: {balance}</p>
      <p className="mb-4 text-gray-700">Staked: {staked}</p>

      <div className="flex gap-4 justify-center">
        <button
          onClick={handleStake}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-xl shadow"
        >
          ➕ Stake 50 ECO
        </button>
        <button
          onClick={handleUnstake}
          className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-xl shadow"
        >
          ♻️ Unstake
        </button>
      </div>
      {status && <p className="mt-3 text-sm text-gray-600">{status}</p>}
    </div>
  );
}

export default Staking;
