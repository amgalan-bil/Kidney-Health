"use client";
import Image from "next/image";
import { useState } from "react";
import { Copy, Check, BarChart, AlertTriangle, Heart } from "lucide-react";
import Link from "next/link";
import ImageCorner from "./imageCorner";

export default function Main() {
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto rounded-3xl shadow-lg bg-white p-8 mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">
          Төслийн зорилго
        </h1>
        <p className="text-gray-700 leading-relaxed text-lg mb-6">
          Эх Хүүхдийн Эрүүл Мэндийн Үндэсний Төвийн хүүхдийн эрүү, нүүрний мэс
          заслын тасагт нэн шаардлагатай мэс заслын багаж, тоног төхөөрөмжийг
          худалдан авч, хандивлах зорилготой юм. Бидэнд нийт{" "}
          <span className="font-bold text-indigo-600">
            $30,000 (USD) буюу 108,000,000 (MNT)
          </span>{" "}
          санхүүжилт хэрэгтэй байгаа тул энэхүү хандивын аяныг зохион байгуулж
          байна.
        </p>

        <div className="mt-8 p-6 bg-blue-50 rounded-2xl">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Энэ яагаад чухал вэ?
          </h2>
          <p className="text-gray-600 mb-4">
            Монгол Улсын 8000 хүүхдийг хамруулсан үндэсний судалгаагаар:
          </p>
          <ul className="space-y-3 text-gray-700 pl-4">
            <li className="flex items-start">
              <span>
                <span className="font-bold">23.1%</span> нь уруул сэтэрхий болон
                эрүү, нүүрний бусад гажигтай.
              </span>
            </li>
            <li className="flex items-start">
              <span>
                <span className="font-bold">6.2%</span> нь нүүрний гэмтэл авсан.
              </span>
            </li>
            <li className="flex items-start">
              <span>
                <span className="font-bold">60%</span> нь эрүү нүүрний хэсэгт
                шүдний хүндрэлтэй тулгарсан.
              </span>
            </li>
          </ul>
          <p className="mt-4 text-gray-600">
            Ялангуяа 14-өөс доош насны хүүхдүүд эмзэг байдаг бөгөөд ойролцоогоор{" "}
            <span className="font-bold">15%</span> нь нүүрний ноцтой гажигтай
            байдаг.
          </p>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            Зохион байгуулагч:
          </h2>
          <ul className="text-gray-700 space-y-1 list-disc list-inside">
            <li>The Brilliant Minds Global, ТББ</li>
            <li>Менторшип – 2025 Үндэсний хөтөлбөр</li>
            <li>Los Angeles Mongolian Student Union</li>
          </ul>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link
            href="/donate"
            className="flex-1 text-center bg-[#344CB7] hover:bg-[#1e2770] active:bg-[#000957] text-white py-3 rounded-2xl font-medium shadow-md cursor-pointer transition-all duration-300 text-lg"
          >
            Дотоодын шилжүүлэг (MNT)
          </Link>
          <a
            href="https://donorbox.org/little-faces-big-smile"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-center py-3 rounded-2xl font-medium shadow-md cursor-pointer transition-all duration-300 text-lg"
          >
            International / Donorbox
          </a>
        </div>
      </div>
      <div className="max-w-4xl mx-auto rounded-3xl shadow-lg bg-white p-8 mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
          Танилцуулга видео
        </h1>

        <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
          <iframe
            className="w-full  h-[450px] sm:h-[500px] lg:h-[600px]"
            src="https://www.youtube.com/embed/v0NpSNKbZCs?start=1"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
      <ImageCorner/>
    </div>
  );
}
