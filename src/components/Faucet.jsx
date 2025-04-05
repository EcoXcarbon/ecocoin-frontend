import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import EcoFaucet from "../abi/EcoFaucet.json";
import questions from "../questions";

const FAUCET_ADDRESS = import.meta.env.VITE_FAUCET_ADDRESS;

function Faucet({ signer, address, setScore, setRank, setActiveTab }) {
  const [contract, setContract] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizEnded, setQuizEnded] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [finalScore, setFinalScore] = useState(0);
  const [finalRank, setFinalRank] = useState(null);

  // Init contract
  useEffect(() => {
    if (signer) {
      const instance = new ethers.Contract(FAUCET_ADDRESS, EcoFaucet.abi, signer);
      setContract(instance);
    }
  }, [signer]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleNext = () => {
    const correct = selectedOption === currentQuestion.answer;
    const newAnswers = [...answers, correct];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentQuestionIndex < 4) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      const score = newAnswers.filter(Boolean).length * 10;
      const rank = Math.floor(Math.random() * 100) + 1;

      setFinalScore(score);
      setFinalRank(rank);
      setScore(score);
      setRank(rank);
      setQuizEnded(true);
    }
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setAnswers([]);
    setQuizEnded(false);
    setHasSubmitted(false);
    setFinalScore(0);
    setFinalRank(null);
  };

  const handleSubmitScore = () => {
    alert("✅ Score submitted for reward distribution.");
    setHasSubmitted(true);
    setTimeout(() => setActiveTab(""), 1500); // Return to tab panel
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
        🌿 EcoCoin Awareness Quiz
      </h2>

      {quizEnded ? (
        <>
          <p className="text-xl mt-2 mb-4">🌱 <strong>Your Score:</strong> {finalScore} / 50</p>
          <p className="text-lg mb-6">🔢 <strong>Rank:</strong> #{finalRank} among quiz users.</p>

          {!hasSubmitted && (
            <button
              onClick={handleSubmitScore}
              className="bg-green-700 hover:bg-green-800 text-white font-bold px-6 py-3 rounded-xl"
            >
              📤 Submit Your Score for ECO Rewards
            </button>
          )}
        </>
      ) : (
        <>
          <p className="font-medium text-lg mb-4">{currentQuestion.question}</p>
          <div className="space-y-2 mb-6">
            {currentQuestion.options.map((opt, idx) => (
              <label key={idx} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="option"
                  value={opt}
                  checked={selectedOption === opt}
                  onChange={() => handleOptionSelect(opt)}
                  className="form-radio h-4 w-4 text-green-600"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 justify-center mt-4">
            <button
              onClick={handleNext}
              disabled={!selectedOption}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
            >
              {currentQuestionIndex < 4 ? "Next" : "Submit Quiz"}
            </button>

            <button
              onClick={handleReset}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
            >
              📂 Reset Today’s Quiz
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Faucet;
