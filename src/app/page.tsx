"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";
import { ErrorBoundary } from "./ErrorBoundary"; // Import the ErrorBoundary

export default function NFCReader() {
  const [nfcData, setNfcData] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isNfcSupported, setIsNfcSupported] = useState(true);

  // Check for NFC API support
  useEffect(() => {
    if (!("NDEFReader" in window)) {
      setIsNfcSupported(false);
      setError("NFC reading is not supported on this device. Please ensure your device supports NFC.");
    }
  }, []);

  // Load data from localStorage
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("nfcData") || "[]") || [];
    setNfcData(savedData);
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (nfcData.length > 0) {
      localStorage.setItem("nfcData", JSON.stringify(nfcData));
    }
  }, [nfcData]);

  const readNFC = async () => {
    if (!isNfcSupported) {
      return;
    }

    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();
      setError(""); // Clear previous errors

      ndef.onreading = (event: any) => {
        const decoder = new TextDecoder();
        const newData: string[] = [];
        for (const record of event.message.records) {
          newData.push(decoder.decode(record.data));
        }

        // Update nfcData with new records
        setNfcData((prevData) => [...prevData, ...newData]);
      };
    } catch (err) {
      setError("Error reading NFC: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const clearData = () => {
    // Animate the removal of data using framer-motion
    setNfcData([]);
    localStorage.removeItem("nfcData");
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
        <div className="bg-white shadow-lg rounded-2xl p-6 max-w-lg w-full text-center">
          <h1 className="text-2xl font-bold mb-4">NFC Reader</h1>

          {/* NFC Read Button */}
          <Button
            onClick={readNFC}
            className="bg-blue-600 text-white px-4 py-2"
            aria-label="Start reading NFC tags"
          >
            {isNfcSupported ? "Read NFC" : "NFC Not Supported"}
          </Button>

          {/* Clear Data Button */}
          <Button
            onClick={clearData}
            className="bg-red-500 text-white px-4 py-2 mt-2 ml-4"
            aria-label="Clear NFC data"
          >
            Clear Data
          </Button>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 mt-2" role="alert">
              {error}
            </p>
          )}

          {/* Instructions for unsupported NFC devices */}
          {!isNfcSupported && (
            <p className="text-gray-500 mt-4">
              Your device does not support NFC. Try using a device that has NFC capabilities, such as some modern Android or iOS phones.
            </p>
          )}

          {/* No NFC Data Found */}
          {nfcData.length === 0 && !error && !isNfcSupported && (
            <p className="text-gray-500 mt-4">No NFC data found. Scan an NFC tag to start.</p>
          )}

          <ul className="mt-4 space-y-2">
            <AnimatePresence>
              {nfcData.map((data, index) => (
                <motion.li
                  key={index}
                  className="bg-gray-200 p-2 rounded-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {data}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </div>
    </ErrorBoundary>
  );
}
