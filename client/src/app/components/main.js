"use client";
import Image from "next/image";
import { useState } from "react";
import { Copy } from "lucide-react";
import Link from "next/link";

export default function Main() {
  return (
    <div>
      <div className="max-w-4xl mx-auto rounded-3xl shadow-md p-8 mt-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Төслийн зорилго
        </h1>

        <p className="text-gray-800 leading-relaxed mb-4">
          Эх Хүүхдийн Эрүүл Мэндийн Үндэсний Төвийн хүүхдийн эрүү, нүүрний мэс
          заслын тасагт нэн шаардлагатай мэс заслын багаж, тоног төхөөрөмжийг
          худалдан авч, хандивлах зорилготой юм. Бидэнд нийт{" "}
          <span className="font-bold">$30,000 (USD), 108,000,000 (MNT)</span>{" "}
          санхүүжилт хэрэгтэй байгаа тул энэхүү хандивын аяныг зохион байгуулж
          байна.
        </p>

        <div className="mb-4">
          <h2 className="font-semibold text-gray-900 mb-1">
            Зохион байгуулагч:
          </h2>
          <ul className="text-gray-700 space-y-1">
            <li>The Brilliant Minds Global, ТББ</li>
            <li>Менторшип – 2025 Үндэсний хөтөлбөр</li>
            <li>Los Angeles Mongolian Student Union</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Link
            href="/donate"
            className="flex-1 text-center bg-[#344CB7] hover:bg-[#1e2770] active:bg-[#000957] text-white py-3 rounded-2xl font-medium shadow cursor-pointer transition-all duration-300"
          >
            Дотоодын шилжүүлэг (MNT)
          </Link>
          <a
            href="https://donorbox.org/smiles-for-mongolia"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-center py-3 rounded-2xl font-medium shadow cursor-pointer transition-all duration-300"
          >
            Олон улсын / Donorbox
          </a>
        </div>
      </div>
      <div className="max-w-4xl  mx-auto rounded-3xl shadow-md p-8 mt-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Танилцуулга видео
        </h1>

        <div className="h-[400px] rounded-lg overflow-hidden">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/v0NpSNKbZCs?start=1"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
      <div className="max-w-4xl mx-auto rounded-3xl shadow-md p-8 mt-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Зургийн булан</h1>

        <Image
          src={"/images/nuurniiGajig.png"}
          alt=""
          aria-hidden="true"
          width={800}
          height={600}
          className="object-cover "
          style={{ height: "auto" }}
        />
      </div>
      {/* <div className="max-w-4xl mx-auto rounded-3xl shadow-md p-8 mt-10">
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

        <button
          onClick={handleCopy}
          className="flex items-center gap-2 mt-5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition font-medium cursor-pointer"
        >
          <Copy size={18} />
          {copied ? "Санамж хуулсан!" : "IBAN хуулан авах"}
        </button>
      </div> */}
    </div>
  );
}
