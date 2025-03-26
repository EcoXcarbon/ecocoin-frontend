import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import EcoStaker from "../artifacts/contracts/EcoStaker.sol/EcoStaker.json";
import EcoCoin from "../artifacts/contracts/EcoCoin.sol/EcoCoin.json";

const STAKER_ADDRESS = "0x4A679253410272dd5232B3Ff7cF5dbB88f295319";

const Staking = ({ provider, signer, address }) => {
  const [amount, setAmount] = useState(0);
  const [status, setStatus] = useState("");
  const [balance, setBalance] = useState(0);
  const [staked, setStaked] = useState(0);
  const [timestamp, setTimestamp] = useState(0);
  const [reward, setReward] = useState(0);
  const [poolTotal, setPoolTotal] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [canClaim, setCanClaim] = useState(false);

  const stakerContract = new ethers.Contract(STAKER_ADDRESS, EcoStaker.abi, signer);
  const [ecoContract, setEcoContract] = useState(null);

  useEffect(() => {
    const setupContracts = async () => {
      const tokenAddr = await stakerContract.ecoToken();
      const eco = new ethers.Contract(tokenAddr, EcoCoin.abi, signer);
      setEcoContract(eco);
    };
    if (signer) setupContracts();
  }, [signer]);

  const fetchStakeInfo = async () => {
    if (!ecoContract) return;
    const [userBal, [userStaked, stakeTime]] = await Promise.all([
      ecoContract.balanceOf(address),
      stakerContract.getStakeInfo(address),
    ]);

    const total = await ecoContract.balanceOf(STAKER_ADDRESS);
    setBalance(parseFloat(ethers.formatUnits(userBal, 18)));
    setStaked(parseFloat(ethers.formatUnits(userStaked, 18)));
    setTimestamp(Number(stakeTime));
    setPoolTotal(parseFloat(ethers.formatUnits(total, 18)));

    const timePassed = Date.now() / 1000 - Number(stakeTime);
    const hasReward = timePassed >= 15 * 86400;
    setCanClaim(hasReward);
    setTimeRemaining(Math.max(0, 15 * 86400 - timePassed));
    const rewardCalc = hasReward ? (userStaked * 7) / 100 : 0;
    setReward(parseFloat(ethers.formatUnits(rewardCalc.toString(), 18)));
  };

  const stake = async () => {
    try {
      setStatus("Staking...");
      const amt = ethers.parseUnits(amount.toString(), 18);
      const tx1 = await ecoContract.approve(STAKER_ADDRESS, amt);
      await tx1.wait();
      const tx2 = await stakerContract.stake(amt);
      await tx2.wait();
      setStatus("Staked successfully!");
      fetchStakeInfo();
    } catch (err) {
      console.error(err);
      setStatus("Stake failed");
    }
  };

  const unstake = async () => {
    try {
      setStatus("Unstaking...");
      const tx = await stakerContract.unstake();
      await tx.wait();
      setStatus("Unstaked successfully!");
      fetchStakeInfo();
    } catch (err) {
      console.error(err);
      setStatus("Unstake failed");
    }
  };

  const claim = async () => {
    try {
      if (!canClaim) return;
      setStatus("Claiming...");
      const tx = await stakerContract.unstake();
      await tx.wait();
      setStatus("Claim successful!");
      fetchStakeInfo();
    } catch (err) {
      console.error(err);
      setStatus("Claim failed");
    }
  };

  useEffect(() => {
    if (provider && signer && address && ecoContract) {
      fetchStakeInfo();
    }
  }, [provider, signer, address, ecoContract]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md mx-auto mt-6">
      <h2 className="text-2xl font-bold text-green-700 mb-4">🌿 Stake ECO</h2>

      <p className="mb-1">Available Balance: <strong>{balance} ECO</strong></p>
      <p className="mb-1">Your Staked: <strong>{staked} ECO</strong></p>
      <p className="mb-1">Earned Rewards: <strong>{reward} ECO</strong></p>
      <p className="mb-1">Total in Pool: <strong>{poolTotal} ECO</strong></p>
      {!canClaim && staked > 0 && (
        <p className="mb-4 text-sm text-gray-500">Reward in: {formatTime(timeRemaining)}</p>
      )}

      <input
        type="number"
        placeholder="Enter amount to stake"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg mb-4"
      />

      <div className="flex justify-between">
        <button
          onClick={stake}
          className="bg-green-400 hover:bg-green-500 text-white px-6 py-2 rounded-xl font-semibold"
        >
          🌱 Stake
        </button>

        <button
          onClick={unstake}
          className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-2 rounded-xl font-semibold"
        >
          🔓 Unstake
        </button>

        <button
          onClick={claim}
          disabled={!canClaim}
          className={`${
            canClaim ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-300 cursor-not-allowed"
          } text-white px-6 py-2 rounded-xl font-semibold`}
        >
          🎁 Claim
        </button>
      </div>

      {status && <p className="mt-4">✅ {status}</p>}
    </div>
  );
};

export default Staking;
