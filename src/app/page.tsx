"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "./button";

export default function NFCReader() {
  const [nfcData, setNfcData] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("nfcData") || "[]") || [];
    setNfcData(savedData);
  }, []);

  useEffect(() => {
    localStorage.setItem("nfcData", JSON.stringify(nfcData));
  }, [nfcData]);

  const readNFC = async () => {
    if (!("NDEFReader" in window)) {
      setError("NFC reading is not supported on this device.");
      return;
    }

    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();
      setError("");
      
      ndef.onreading = (event: any) => {
        const decoder = new TextDecoder();
        for (const record of event.message.records) {
          setNfcData((prevData: string[]) => [...prevData, decoder.decode(record.data)]);
        }
      };
    } catch (err) {
      setError("Error reading NFC: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const clearData = () => {
    setNfcData([]);
    localStorage.removeItem("nfcData");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-6 max-w-lg w-full text-center">
        <h1 className="text-2xl font-bold mb-4">NFC Reader</h1>
        <Button onClick={readNFC} className="bg-blue-600 text-white px-4 py-2">Read NFC</Button>
        <Button onClick={clearData} className="bg-red-500 text-white px-4 py-2 mt-2 ml-4">Clear Data</Button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        <ul className="mt-4 space-y-2">
          {nfcData.map((data, index) => (
            <motion.li 
              key={index} 
              className="bg-gray-200 p-2 rounded-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {data}
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
