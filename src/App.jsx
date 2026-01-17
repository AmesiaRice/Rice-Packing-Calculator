import { useEffect, useState } from "react";
import "./App.css";

const API_URL =
  "https://script.google.com/macros/s/AKfycbyfNFhtSNerR6KIWPiKZuM4LJqS-bSfKq5fD0sA5BXF-qtN3r7K1tF2TQMEHnBHkfAN/exec";

// 🔹 OPTIONS
const VARIETIES = ["1121", "1509", "1718", "1401", "PR-14"];
const QUALITIES = ["Golden Sella", "Lemon Sella", "White Sella", "Steam"];
const PACKAGING_TEXTURES = ["BoPP", "Laminated Pouches", "Jute", "Non Woven"];
const PACKAGING_TYPES = ["Pinch Bottom", "2D", "3D", "With Inner", "Without Inner"];
const PACKAGING_SIZES = ["5KG", "10KG", "20KG", "25KG", "30KG", "35KG", "40KG"];

// 🔹 REUSABLE COMPONENTS
function Select({ label, options = [], value, onChange }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function Input({ label, type = "text", value, onChange }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        placeholder={label}
      />
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-lg font-semibold text-gray-800">{value}</p>
    </div>
  );
}

function Result({ label, value }) {
  return (
    <div className="flex justify-between bg-white rounded-lg p-3 shadow-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

// 🔹 MAIN APP
export default function App() {
  const [variety, setVariety] = useState("");
  const [quality, setQuality] = useState("");
  const [texture, setTexture] = useState("");
  const [type, setType] = useState("");
  const [size, setSize] = useState("");

  const [ricePrice, setRicePrice] = useState(0);
  const [packaging, setPackaging] = useState({
    finalRatePerPC: 0,
    ratePerTon: 0,
    labourPerTon: 0,
  });

  const [docCost, setDocCost] = useState(0);
  const [factoryPort, setFactoryPort] = useState(0);
  const [cifExpense, setCifExpense] = useState(0);
  const [margin, setMargin] = useState(0);
  const [cifMargin, setCifMargin] = useState(0);

  // 🔁 FETCH DATA
  useEffect(() => {
    const riceReady = variety && quality;
    const packReady = texture && type && size;

    if (!riceReady && !packReady) return;

    const url = `${API_URL}?variety=${variety}&quality=${quality}&texture=${texture}&type=${type}&size=${size}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (riceReady) setRicePrice(data.ricePricePerTon || 0);
        if (packReady) setPackaging(data.packaging || {});
      });
  }, [variety, quality, texture, type, size]);

  // 🔹 CALCULATIONS
  const fobPerKg =
    Number(ricePrice) +
    Number(packaging.ratePerTon) +
    Number(packaging.labourPerTon) +
    Number(docCost) +
    Number(factoryPort);

  const fobUSD = fobPerKg / 90;
  const fobWithMargin = fobUSD * (1 + Number(margin) / 100);
  const cifFinal = (fobPerKg + Number(cifExpense))/90 * (1 + Number(cifMargin) / 100);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-6 md:p-10">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-green-700 mb-8">
          Rice Export Costing Calculator
        </h1>

        {/* INPUTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select label="Variety" options={VARIETIES} value={variety} onChange={setVariety} />
          <Select label="Quality" options={QUALITIES} value={quality} onChange={setQuality} />
          <Select label="Packaging Texture" options={PACKAGING_TEXTURES} value={texture} onChange={setTexture} />
          <Select label="Packaging Type" options={PACKAGING_TYPES} value={type} onChange={setType} />
          <Select label="Packaging Size" options={PACKAGING_SIZES} value={size} onChange={setSize} />

          <Input label="Documentation Cost / Ton" type="number" value={docCost} onChange={setDocCost} />
          <Input label="Factory to Port / Ton" type="number" value={factoryPort} onChange={setFactoryPort} />
          <Input label="CIF Expense / KG" type="number" value={cifExpense} onChange={setCifExpense} />
          <Input label="Margin %" type="number" value={margin} onChange={setMargin} />
          <Input label="CIF Margin %" type="number" value={cifMargin} onChange={setCifMargin} />
        </div>

        {/* AUTO FETCHED */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Stat title="Rice Price / Ton" value={`₹ ${ricePrice}`} />
          <Stat title="Packaging Rate / Ton" value={`₹ ${packaging.ratePerTon}`} />
          <Stat title="Labour Rate / Ton" value={`₹ ${packaging.labourPerTon}`} />
        </div>

        {/* RESULTS */}
        <div className="mt-10 bg-green-50 border border-green-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-green-800 mb-4">Final Costing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Result label="Total FOB Cost / KG (INR)" value={`₹ ${fobPerKg}`} />
            <Result label="FOB Cost / KG ($)" value={`$ ${fobUSD.toFixed(2)}`} />
            <Result label="Final FOB with Margin ($)" value={`$ ${fobWithMargin.toFixed(2)}`} />
            <Result label="Final CIF Cost / KG ($)" value={`$ ${cifFinal.toFixed(2)}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
