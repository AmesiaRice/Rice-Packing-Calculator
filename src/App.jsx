import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./App.css";

const API_URL =
  "https://script.google.com/macros/s/AKfycbyfNFhtSNerR6KIWPiKZuM4LJqS-bSfKq5fD0sA5BXF-qtN3r7K1tF2TQMEHnBHkfAN/exec";

// 🔹 OPTIONS
const VARIETIES = ["1121", "1509", "1718", "1401", "PR-14"];
const QUALITIES = ["Golden Sella", "Lemon Sella", "White Sella", "Steam"];
const PACKAGING_TEXTURES = ["BoPP", "Laminated Pouches", "Jute", "Non Woven"];
const PACKAGING_TYPES = ["Pinch Bottom", "2D", "3D", "With Inner", "Without Inner"];
const PACKAGING_SIZES = ["5KG", "10KG", "20KG", "25KG", "30KG", "35KG", "40KG"];

// 🔹 ANIMATIONS
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0 }
};

// 🔹 REUSABLE COMPONENTS
function Select({ label, options = [], value, onChange }) {
  return (
    <motion.div variants={fadeUp}>
      <label className="text-sm font-semibold text-gray-600">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3
        bg-white/80 backdrop-blur shadow-sm
        focus:ring-2 focus:ring-green-500 transition-all"
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </motion.div>
  );
}

function Input({ label, type = "text", value, onChange }) {
  return (
    <motion.div variants={fadeUp}>
      <label className="text-sm font-semibold text-gray-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3
        shadow-sm focus:ring-2 focus:ring-green-500 transition-all"
      />
    </motion.div>
  );
}

function Stat({ title, value }) {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      className="rounded-2xl bg-gradient-to-br from-green-50 to-white
      p-6 shadow-md border border-green-100"
    >
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-green-700 mt-2">{value}</p>
    </motion.div>
  );
}

function Result({ label, value }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex justify-between items-center
      rounded-xl bg-white p-4 shadow border"
    >
      <span className="text-gray-600">{label}</span>
      <span className="text-lg font-bold text-green-700">{value}</span>
    </motion.div>
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

  const [docCost, setDocCost] = useState(2000);
  const [cifExpense, setCifExpense] = useState(0);
  const [margin, setMargin] = useState(10);
  const [cifMargin, setCifMargin] = useState(10);

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

  // 🔹 CALCULATIONS (UNCHANGED)
  const fobPerKg =
    Number(ricePrice) +
    Number(packaging.ratePerTon) +
    Number(packaging.labourPerTon) +
    Number(docCost) +
    Number(2000);

  const fobUSD = fobPerKg / 90;
  const fobWithMargin = fobUSD * (1 + Number(margin) / 100);
  const cifUsd =
    (fobPerKg + Number(cifExpense)) / 90;
  const cifFinal =cifUsd *(1 + Number(cifMargin) / 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-50 p-6">
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto bg-white/90 backdrop-blur
        shadow-2xl rounded-3xl p-8 md:p-12"
      >
        {/* HEADER */}
        <motion.h1
          variants={fadeUp}
          className="text-4xl font-extrabold text-center
          bg-gradient-to-r from-green-600 to-emerald-500
          bg-clip-text text-transparent mb-12"
        >
          Rice Export Costing Calculator
        </motion.h1>

        {/* INPUTS */}
        <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Select label="Variety" options={VARIETIES} value={variety} onChange={setVariety} />
          <Select label="Quality" options={QUALITIES} value={quality} onChange={setQuality} />
          <Select label="Packaging Texture" options={PACKAGING_TEXTURES} value={texture} onChange={setTexture} />
          <Select label="Packaging Type" options={PACKAGING_TYPES} value={type} onChange={setType} />
          <Select label="Packaging Size" options={PACKAGING_SIZES} value={size} onChange={setSize} />
          <Input label="Documentation Cost / Ton" type="number" value={docCost} onChange={setDocCost} />
          <Input label="Margin %" type="number" value={margin} onChange={setMargin} />
        </motion.div>

        {/* STATS */}
        <motion.div variants={container} className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Stat title="Rice Price / Ton" value={`₹ ${ricePrice}`} />
          <Stat title="Packaging Rate / Ton" value={`₹ ${packaging.ratePerTon}`} />
          <Stat title="Labour Rate / Ton" value={`₹ ${packaging.labourPerTon}`} />
        </motion.div>

        {/* FOB */}
        <motion.div variants={fadeUp}
          className="mt-12 from-green-50 to-white
          border border-green-200 rounded-3xl p-8 shadow-lg"
        >
          <h2 className="text-xl font-semibold text-green-800 mb-6">FOB Costing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Result label="Total FOB Cost ($)" value={`$ ${fobUSD.toFixed(2)}`} />
            <Result label="FOB Cost With Margin ($)" value={`$ ${fobWithMargin.toFixed(2)}`} />
          </div>
        </motion.div>

        {/* CIF */}
        <motion.div variants={fadeUp}
          className="mt-12 bg-gradient-to-br from-emerald-50 to-white
          border border-emerald-200 rounded-3xl p-8 shadow-lg"
        >
          <h2 className="text-xl font-semibold text-green-800 text-center mb-8">CIF Costing</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Input label="CIF Port" type="number" value={cifExpense} onChange={setCifExpense} />
            <Input label="CIF Margin %" type="number" value={cifMargin} onChange={setCifMargin} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Result label="Final FOB with Margin ($)" value={`$ ${cifUsd.toFixed(2)}`} />
            <Result label="Final CIF Cost / KG ($)" value={`$ ${cifFinal.toFixed(2)}`} />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
