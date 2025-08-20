import React, { useEffect, useState } from "react";

const images = [
  "https://media.licdn.com/dms/image/v2/C4D12AQFiQFFqj3tQRw/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1651306384748?e=2147483647&v=beta&t=s2GHTrthYqGx61th0nKOpXOzMgE-8_6-3Mmg3taw_YE",
  "https://news.coincu.com/wp-content/uploads/2023/05/NFT-Ticketing.png",
  "https://unicsoft.com/wp-content/uploads/2023/01/1140-2.png",
  "https://framerusercontent.com/images/RKC6DEPPv6qOy7ASeyXmspWdY.webp",
  "https://www.ledgerinsights.com/wp-content/uploads/2023/05/nft-tickets.2.jpg",
];

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const getPositionStyle = (imgIndex) => {
    if (imgIndex === index) {
      return {
        transform: "translateX(0)",
        filter: "none",
        zIndex: 3,
        opacity: 1,
        animation: "scalePulse 3s ease-in-out infinite",
      };
    } else if (imgIndex === (index + 1) % images.length) {
      return {
        transform: "translateX(120%) scale(0.85)",
        filter: "blur(4px)",
        zIndex: 2,
        opacity: 0.6,
        animation: "none",
      };
    } else if (imgIndex === (index - 1 + images.length) % images.length) {
      return {
        transform: "translateX(-120%) scale(0.85)",
        filter: "blur(4px)",
        zIndex: 2,
        opacity: 0.6,
        animation: "none",
      };
    } else {
      return {
        transform: "translateX(200%)",
        opacity: 0,
        zIndex: 1,
        animation: "none",
      };
    }
  };

  return (
    <>
      {/* Keyframe animation styles */}
      <style>{`
        @keyframes scalePulse {
          0% { transform: translateX(0) scale(0.85); }
          50% { transform: translateX(0) scale(1.1); }
          100% { transform: translateX(0) scale(0.85); }
        }
      `}</style>

      <section
        className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage:
            "url('https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA4L2pvYjEwNDgtYmFja2dyb3VuZC0wMi5qcGc.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30 z-0" />

        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-80 z-10"
        >
          <source src="/instructional-nft-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Foreground Content */}
        <div className="relative z-20 max-w-7xl w-full px-6 py-16 flex flex-col md:flex-row items-center text-center md:text-left gap-12">
          {/* Carousel Image (Now on the left) */}
          <div
            className="relative flex items-center justify-center overflow-hidden rounded-xl shadow-2xl"
            style={{
              width: "50vw",
              height: "60vh", // Increased height by 10%
              minWidth: "300px",
              minHeight: "300px",
            }}
          >
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`NFT ${i}`}
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "0.75rem",
                  transition: "all 0.8s ease-in-out",
                  boxShadow:
                    i === index
                      ? "0 10px 25px rgba(0, 0, 0, 0.4)"
                      : "0 4px 12px rgba(0, 0, 0, 0.2)",
                  ...getPositionStyle(i),
                }}
              />
            ))}
          </div>

          {/* Text Content (Now on the right) */}
          <div className="flex-1">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-6">
              Scan. Mint. Remember.
            </h1>
            <p className="text-lg md:text-xl text-white font-medium max-w-2xl mx-auto md:mx-0 drop-shadow">
              Dynamic NFT tickets that evolve after entry — flip status from
              <em> “Unused”</em> to <em>“I Was There”</em>, and unlock post‑event perks.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center md:justify-start items-center gap-6">
              <a
                href="#mint"
                className="px-8 py-4 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition shadow-lg"
              >
                Mint Ticket
              </a>
              <a
                href="#myticket"
                className="px-8 py-4 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition shadow-lg"
              >
                View My Ticket
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
