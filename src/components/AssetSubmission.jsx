import React, { useState } from "react";
import { db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";

const categories = {
  Tree: ["Poplar", "Sheesham", "Mulberry", "Kikar", "Eucalyptus", "Fruit Tree", "Others"],
  Solar: ["Rooftop Solar (KW)", "Ground-Mounted Solar (KW)"],
  EV: ["Electric Car", "Electric Bike", "Electric Rickshaw", "Electric Bus"],
  Biochar: ["Household", "Agricultural", "Industrial"],
  Biogas: ["Household", "Commercial", "Community-level"],
  Watershed: ["Check Dam", "Percolation Tank", "Bund"],
  ImprovedCookstove: ["Single-pot ICS", "Double-pot ICS"],
};

const sequestrationRates = {
  Poplar: 21,
  Sheesham: 25,
  Mulberry: 18,
  Kikar: 20,
  Eucalyptus: 26,
  "Fruit Tree": 15,
  Others: 19,
};

export default function AssetSubmission() {
  const [assetType, setAssetType] = useState("Tree");
  const [subtype, setSubtype] = useState("");
  const [location, setLocation] = useState("");
  const [installationDate, setInstallationDate] = useState("");
  const [protectionYears, setProtectionYears] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [co2Estimate, setCo2Estimate] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const calculateCO2 = () => {
    if (assetType === "Tree" && subtype in sequestrationRates) {
      const annualRate = sequestrationRates[subtype];
      const totalCO2 = quantity * annualRate * protectionYears;
      setCo2Estimate(totalCO2.toFixed(2));
    } else {
      setCo2Estimate("Estimation only supported for trees.");
    }
  };

  const handleSubmit = async () => {
    const data = {
      assetType,
      subtype,
      location,
      installationDate,
      protectionYears,
      quantity,
      note,
      co2Estimate,
      timestamp: Date.now(),
    };
    try {
      await addDoc(collection(db, "assetSubmissions"), data);
      setSubmitted(true);
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Error submitting form. Please try again.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-3xl mx-auto mt-6">
      <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
        🌿 Submit Environmental Asset Data
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <select value={assetType} onChange={(e) => { setAssetType(e.target.value); setSubtype(""); }} className="border p-2 rounded">
          {Object.keys(categories).map((cat, i) => (
            <option key={i} value={cat}>{cat}</option>
          ))}
        </select>

        <select value={subtype} onChange={(e) => setSubtype(e.target.value)} className="border p-2 rounded">
          <option value="">Select subtype</option>
          {categories[assetType].map((type, i) => (
            <option key={i} value={type}>{type}</option>
          ))}
        </select>

        <input type="text" placeholder="Location (lat, lng or address)" value={location} onChange={(e) => setLocation(e.target.value)} className="border p-2 rounded" />
        <input type="date" value={installationDate} onChange={(e) => setInstallationDate(e.target.value)} className="border p-2 rounded" />

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Protection Duration (Years)</label>
          <input type="number" value={protectionYears} onChange={(e) => setProtectionYears(Number(e.target.value))} className="border p-2 rounded" />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Quantity / Number of Units</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="border p-2 rounded" />
        </div>

        <textarea placeholder="Notes (optional)" value={note} onChange={(e) => setNote(e.target.value)} className="border p-2 rounded col-span-2" />

        <div className="col-span-2">
          <button onClick={calculateCO2} className="bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2 hover:bg-blue-700">
            Estimate CO₂
          </button>
          <button onClick={handleSubmit} className="bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700">
            Submit Asset
          </button>
        </div>
      </div>

      {co2Estimate && (
        <div className="bg-green-50 border border-green-300 text-green-800 p-4 rounded mt-4">
          Estimated Sequestration: <strong>{co2Estimate}</strong> kg CO₂
        </div>
      )}

      {submitted && (
        <p className="mt-4 text-green-600 font-semibold">✅ Submitted successfully!</p>
      )}
    </div>
  );
}
