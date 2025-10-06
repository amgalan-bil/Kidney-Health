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
        <Image
          src="/images/mentorship2025.jpg"
          alt="mentorship2025"
          width={120}
          height={60}
          className="h-auto w-20 sm:w-32 pointer-events-none"
        />
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
        <h1 className="text-white text-4xl md:text-6xl font-bold text-center p-4">
          Монголын хүүхдүүдэд инээмсэглэл
        </h1>
      </div>
    </div>
  );
};

export default Header;
