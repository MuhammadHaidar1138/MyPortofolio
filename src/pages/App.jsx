import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import CardSwap, { Card } from "../components/CardSwap";
import SplitText from "../components/SplitText";
import DecryptedText from "../components/DecryptedText";
import Squares from "../components/Squares"; // Pastikan file Squares.jsx sudah ada

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col justify-between px-4 relative overflow-hidden"
      style={{ background: "#000" }}
    >
      {/* Animated background, sama seperti About */}
      <Squares
        direction="right"
        speed={0.5}
        borderColor="rgba(34,197,94,0.7)"
        squareSize={40}
        hoverFillColor="#000"
      />
      <div className="flex flex-1 flex-row items-center justify-center max-w-7xl mx-auto w-full relative z-10">
        {/* Kiri: Teks */}
        <div className="flex-1 flex flex-col justify-center items-start pl-2 md:pl-12">
          <SplitText
            text="Card stacks have never looked so good"
            className="text-gray-200 text-4xl md:text-5xl font-bold mb-4 leading-tight"
            splitType="words, chars"
            delay={30}
            duration={0.7}
            textAlign="left"
          />
          <DecryptedText
            text="Just look at it go!"
            speed={20}
            sequential
            revealDirection="start"
            className="text-gray-400 text-lg md:text-xl mt-2"
            encryptedClassName="text-gray-600"
            parentClassName=""
            animateOn="view"
          />
          <motion.button
            whileHover={{
              scale: 1.07,
              background: "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)",
              boxShadow: "0 8px 32px 0 rgba(34,197,94,0.25)",
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/about")}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-bold rounded-full shadow-lg transition-all duration-300 outline-none mt-8 focus:ring-4 focus:ring-green-400/40"
          >
            Get Started
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </motion.button>
        </div>
        {/* Kanan: CardSwap */}
        <div className="flex-1 flex items-center justify-center relative min-h-[400px]">
          <div
            className="relative w-full flex items-center justify-center"
            style={{ minHeight: 400 }}
          >
            <CardSwap
              width={520}
              height={340}
              cardDistance={90}
              verticalDistance={70}
              delay={3500}
            >
              <Card className="bg-gradient-to-br from-neutral-900 to-neutral-800 border-green-400 text-white flex items-center justify-start text-lg font-semibold px-8 py-4 gap-2">
                <span className="inline-block bg-gray-800 px-3 py-1 rounded text-xs font-bold mr-3">
                  ⚙️ Customizable
                </span>
                <span className="text-7xl font-extrabold tracking-tight ml-6">
                  3
                </span>
              </Card>
              <Card className="bg-gradient-to-br from-neutral-900 to-neutral-800 border-green-400 text-white flex items-center justify-start text-lg font-semibold px-8 py-4 gap-2">
                <span className="inline-block bg-gray-800 px-3 py-1 rounded text-xs font-bold mr-3">
                  ✨ Smooth
                </span>
                <span className="text-3xl font-bold ml-6">UI Animation</span>
              </Card>
              <Card className="bg-gradient-to-br from-neutral-900 to-neutral-800 border-green-400 text-white flex items-center justify-start text-lg font-semibold px-8 py-4 gap-2">
                <span className="inline-block bg-gray-800 px-3 py-1 rounded text-xs font-bold mr-3">
                  &lt;/&gt; Reliable
                </span>
                <span className="text-3xl font-bold ml-6">React Ready</span>
              </Card>
            </CardSwap>
          </div>
        </div>
      </div>
      <footer className="text-white-700 text-sm text-center pb-4 mt-8 relative z-10">
        &copy; {new Date().getFullYear()} Haidar. All rights reserved.
      </footer>
    </div>
  );
}
