"use client";
import React from "react";
import Image from "next/image";

// Simple hero header with background image and large title
const Header = () => {
  return (
    <div className="relative flex items-center justify-center w-full min-h-[30vh] sm:min-h-[40vh] lg:min-h-[50vh] overflow-hidden">
      {/* Background image */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-4">
        <Image
          src="/images/LAMSU-removebg-preview.png"
          alt="LAMSU"
          width={120}
          height={60}
          className="h-auto w-16 sm:w-24 pointer-events-none"
        />
        <p className="">Менторшип – 2025 Үндэсний хөтөлбөр</p>
      </div>
      <Image
        src={"/images/donation.jpg"}
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="object-cover z-0 pointer-events-none"
      />
      <div className="absolute inset-0 bg-black opacity-40 z-10 pointer-events-none" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-full">
        <div className="text-white text-xl md:text-7xl font-bold text-center p-4 [text-shadow:_2px_2px_4px_rgb(0_0_0_/_40%)]">
          Little Faces Big Smiles
          <br />
          <p className="text-lg md:text-3xl">
            Монголын хүүхдүүдэд инээмсэглэл
          </p>
        </div>
      </div>
    </div>
  );
};

export default Header;
