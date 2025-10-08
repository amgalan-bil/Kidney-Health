"use client";
import React, { useState } from "react";
import { Copy, CreditCard, QrCode } from "lucide-react";
import { post } from "../api"; // Assuming you have a post helper in api.js

const Donate = () => {
  // State for the donation form
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  // State for API interaction and UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qpayData, setQpayData] = useState(null);

  // State for the IBAN copy functionality
  const [copied, setCopied] = useState(false);
  const iban = "MN29 0005 00 5402101950";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(iban);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setQpayData(null);

    // IMPORTANT: This userId should be dynamic, passed via props or from URL.
    // This is the ID of the user profile the donation is for.
    const userId = "664330115018612fc855b53b"; // Example User ID

    try {
      const data = await post("/api/v1/donation/create-invoice", {
        amount: parseInt(amount, 10),
        userId,
        name,
        message,
      });

      if (data && data.success) {
        setQpayData(data.qpayData);
      } else {
        setError(data.message || "Failed to create QPay invoice.");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      {/* QPay Donation Form */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <QrCode className="mr-3 text-indigo-600" /> QPay-ээр хандивлах
        </h2>

        {!qpayData ? (
          <form onSubmit={handleDonate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Нэр
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Нэрээ оруулна уу"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Хандивын дүн (MNT)
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="5000"
                  required
                />
              </div>
            </div>
            <div className="mt-6">
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700"
              >
                Зурвас (заавал биш)
              </label>
              <textarea
                id="message"
                rows="3"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Сэтгэгдлээ үлдээнэ үү..."
              ></textarea>
            </div>
            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
              >
                {loading ? "Уншиж байна..." : "QR үүсгэх"}
              </button>
            </div>
            {error && <p className="mt-4 text-center text-red-600">{error}</p>}
          </form>
        ) : (
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Төлбөрөө гүйцэтгэнэ үү
            </h3>
            <p className="text-gray-600 mb-4">
              Доорх QR кодыг уншуулна уу эсвэл банкны апп-г сонгоно уу.
            </p>
            <div className="flex justify-center">
              <img
                src={qpayData.qr_image}
                alt="QPay QR Code"
                className="w-64 h-64 border rounded-lg"
              />
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {qpayData.urls.map((link) => (
                <a
                  key={link.name}
                  href={link.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-2 border rounded-lg hover:bg-gray-100 transition"
                >
                  <img
                    src={link.logo}
                    alt={link.description}
                    className="w-8 h-8 mr-2"
                  />
                  <span className="text-sm font-medium">{link.name}</span>
                </a>
              ))}
            </div>
            <button
              onClick={() => setQpayData(null)}
              className="mt-6 text-indigo-600 hover:text-indigo-800 font-medium"
            >
              &larr; Буцах
            </button>
          </div>
        )}
      </div>

      {/* Other Donation Methods */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <CreditCard className="mr-3 text-emerald-600" /> Бусад сонголтууд
        </h2>
        <div className="space-y-2 mt-3 text-gray-800">
          <p>
            <span className="font-semibold">Банк:</span> ХААН БАНК
          </p>
          <p>
            <span className="font-semibold">Дансны нэр:</span> Насанжаргал
            Болортуяа
          </p>
          <p>
            <span className="font-semibold">IBAN:</span> {iban}
          </p>
          <p>
            <span className="font-semibold">Дансны дугаар:</span> 5402101950
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition font-medium cursor-pointer"
          >
            <Copy size={18} />
            {copied ? "IBAN хуулсан!" : "IBAN хуулах"}
          </button>
          <a
            href="https://donorbox.org/smiles-for-mongolia"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-center py-3 rounded-lg font-medium shadow"
          >
            Олон улсын / Donorbox
          </a>
        </div>
      </div>
    </div>
  );
};

export default Donate;
