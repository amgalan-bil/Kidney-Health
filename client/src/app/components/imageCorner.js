import React from "react";
import Image from "next/image";

const ImageCorner = () => {
  return (
    <div className="max-w-4xl mx-auto rounded-3xl shadow-lg bg-white p-8 mb-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        Зургийн булан ба танилцуулга
      </h1>

      <div className="mb-8 rounded-lg overflow-hidden shadow-md">
        <Image
          src={"/images/nuurniiGajig.png"}
          alt="Нүүрний гажигтай хүүхдийн зураг"
          width={800}
          height={600}
          className="w-full h-auto object-cover"
        />
      </div>

      <div className="aspect-w-4 aspect-h-5">
        <iframe
          src="/pdf/surgicaldevices.pdf"
          title="Project Presentation PDF"
          className="w-full h-[600px] md:h-[800px] border-none rounded-lg"
        />
      </div>
    </div>
  );
};

export default ImageCorner;
