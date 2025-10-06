"use client";
import React, { useState } from "react";
import { Copy } from "lucide-react";

const Donate = () => {
  const [copied, setCopied] = useState(false);

  const iban = "MN29 0005 00 5402101950";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(iban);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div>
      {" "}
      <div className="max-w-4xl mx-auto rounded-3xl shadow-md p-8 mt-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Хандив шилжүүлэх дансны мэдээлэл
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
          <p>
            <span className="font-semibold">Байгууллагын нэр:</span> Smiles for
            Mongolia
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 mt-5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition font-medium cursor-pointer"
          >
            <Copy size={18} />
            {copied ? "IBAN хуулсан!" : "IBAN хуулан авах"}
          </button>
          <a
            href="https://donorbox.org/smiles-for-mongolia"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-center py-3 rounded-2xl font-medium shadow mt-5"
          >
            Олон улсын / Donorbox
          </a>
        </div>
      </div>
    </div>
  );
};

export default Donate;
