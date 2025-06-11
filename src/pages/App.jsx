import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SplitText from "../components/SplitText";
import ProfileImg from "../assets/image/Profile.png";

// Komponen Squares untuk background grid animasi
const Squares = ({
  direction = "right",
  speed = 1,
  borderColor = "rgba(34,197,94,0.7)", // glowing lime sesuai tema
  squareSize = 40,
  hoverFillColor = "#000", // hover hitam saja
}) => {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const numSquaresX = useRef(0);
  const numSquaresY = useRef(0);
  const gridOffset = useRef({ x: 0, y: 0 });
  const hoveredSquareRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      // Gunakan window.innerWidth/Height agar canvas selalu penuh
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      numSquaresX.current = Math.ceil(canvas.width / squareSize) + 1;
      numSquaresY.current = Math.ceil(canvas.height / squareSize) + 1;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const drawGrid = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize;
      const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize;

      for (let x = startX; x < canvas.width + squareSize; x += squareSize) {
        for (let y = startY; y < canvas.height + squareSize; y += squareSize) {
          const squareX = x - (gridOffset.current.x % squareSize);
          const squareY = y - (gridOffset.current.y % squareSize);

          // Hover effect (warna hitam saja)
          if (
            hoveredSquareRef.current &&
            Math.floor((x - startX) / squareSize) === hoveredSquareRef.current.x &&
            Math.floor((y - startY) / squareSize) === hoveredSquareRef.current.y
          ) {
            ctx.fillStyle = hoverFillColor;
            ctx.fillRect(squareX, squareY, squareSize, squareSize);
          }

          // Glowing border
          ctx.save();
          ctx.shadowColor = borderColor;
          ctx.shadowBlur = 8;
          ctx.strokeStyle = borderColor;
          ctx.strokeRect(squareX, squareY, squareSize, squareSize);
          ctx.restore();
        }
      }

      // Gradient gelap di tengah
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / 2
      );
      gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      gradient.addColorStop(1, "#060010");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const updateAnimation = () => {
      const effectiveSpeed = Math.max(speed, 0.1);
      switch (direction) {
        case "right":
          gridOffset.current.x =
            (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize;
          break;
        case "left":
          gridOffset.current.x =
            (gridOffset.current.x + effectiveSpeed + squareSize) % squareSize;
          break;
        case "up":
          gridOffset.current.y =
            (gridOffset.current.y + effectiveSpeed + squareSize) % squareSize;
          break;
        case "down":
          gridOffset.current.y =
            (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize;
          break;
        case "diagonal":
          gridOffset.current.x =
            (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize;
          gridOffset.current.y =
            (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize;
          break;
        default:
          break;
      }

      drawGrid();
      requestRef.current = requestAnimationFrame(updateAnimation);
    };

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize;
      const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize;

      const hoveredSquareX = Math.floor(
        (mouseX + gridOffset.current.x - startX) / squareSize
      );
      const hoveredSquareY = Math.floor(
        (mouseY + gridOffset.current.y - startY) / squareSize
      );

      if (
        !hoveredSquareRef.current ||
        hoveredSquareRef.current.x !== hoveredSquareX ||
        hoveredSquareRef.current.y !== hoveredSquareY
      ) {
        hoveredSquareRef.current = { x: hoveredSquareX, y: hoveredSquareY };
      }
    };

    const handleMouseLeave = () => {
      hoveredSquareRef.current = null;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    requestRef.current = requestAnimationFrame(updateAnimation);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [direction, speed, borderColor, hoverFillColor, squareSize]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full border-none block fixed inset-0 z-0"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        width: "100vw",
        height: "100vh",
        background: "#000",
      }}
      tabIndex={-1}
      aria-hidden="true"
    ></canvas>
  );
};

// TrueFocus: animasi border langsung ke seluruh nama (Muhammad Haidar)
const TrueFocus = ({
  sentence = "True Focus",
  blurAmount = 5,
  borderColor = "green",
  glowColor = "rgba(0, 255, 0, 0.6)",
  animationDuration = 0.5,
}) => {
  const words = sentence.split(" ");
  const containerRef = useRef(null);
  const wordRefs = useRef([]);
  const [focusRect, setFocusRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [show, setShow] = useState(false);

  // Setelah mount, animasikan border ke seluruh nama
  useEffect(() => {
    if (!containerRef.current || !wordRefs.current[0]) return;
    const parentRect = containerRef.current.getBoundingClientRect();
    const firstRect = wordRefs.current[0].getBoundingClientRect();
    const lastRect = wordRefs.current[words.length - 1].getBoundingClientRect();
    setFocusRect({
      x: firstRect.left - parentRect.left,
      y: firstRect.top - parentRect.top,
      width: lastRect.right - firstRect.left,
      height: Math.max(firstRect.height, lastRect.height),
    });
    setShow(true);
  }, [sentence, words.length]);

  return (
    <div
      className="relative flex gap-4 justify-center items-center flex-wrap"
      ref={containerRef}
    >
      {words.map((word, index) => (
        <span
          key={index}
          ref={(el) => (wordRefs.current[index] = el)}
          className="relative text-[2rem] md:text-[2.5rem] font-black cursor-pointer text-green-400"
          style={{
            filter: show ? "blur(0px)" : `blur(${blurAmount}px)`,
            "--border-color": borderColor,
            "--glow-color": glowColor,
            transition: `filter ${animationDuration}s ease`,
          }}
        >
          {word}
        </span>
      ))}

      <motion.div
        className="absolute top-0 left-0 pointer-events-none box-border border-0"
        animate={{
          x: focusRect.x,
          y: focusRect.y,
          width: focusRect.width,
          height: focusRect.height,
          opacity: focusRect.width > 0 ? 1 : 0,
        }}
        transition={{
          duration: animationDuration,
        }}
        style={{
          "--border-color": borderColor,
          "--glow-color": glowColor,
        }}
      >
        <span
          className="absolute w-4 h-4 border-[3px] rounded-[3px] top-[-10px] left-[-10px] border-r-0 border-b-0"
          style={{
            borderColor: "var(--border-color)",
            filter: "drop-shadow(0 0 4px var(--border-color))",
          }}
        ></span>
        <span
          className="absolute w-4 h-4 border-[3px] rounded-[3px] top-[-10px] right-[-10px] border-l-0 border-b-0"
          style={{
            borderColor: "var(--border-color)",
            filter: "drop-shadow(0 0 4px var(--border-color))",
          }}
        ></span>
        <span
          className="absolute w-4 h-4 border-[3px] rounded-[3px] bottom-[-10px] left-[-10px] border-r-0 border-t-0"
          style={{
            borderColor: "var(--border-color)",
            filter: "drop-shadow(0 0 4px var(--border-color))",
          }}
        ></span>
        <span
          className="absolute w-4 h-4 border-[3px] rounded-[3px] bottom-[-10px] right-[-10px] border-l-0 border-t-0"
          style={{
            borderColor: "var(--border-color)",
            filter: "drop-shadow(0 0 4px var(--border-color))",
          }}
        ></span>
      </motion.div>
    </div>
  );
};

function App() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-between px-4 relative overflow-hidden" style={{ background: "#000" }}>
      {/* Animated background */}
      <Squares
        direction="right"
        speed={0.5}
        borderColor="rgba(34,197,94,0.7)"
        squareSize={40}
        hoverFillColor="#000"
      />
      {/* Konten utama */}
      <div className="relative z-10 flex flex-1 items-center justify-center">
        <div className="flex flex-col md:flex-row items-center md:items-center gap-12 w-full max-w-5xl mx-auto">
          {/* Profile Card */}
          <div className="flex flex-col items-center w-full md:w-auto">
            <motion.div
              initial={{ filter: "blur(18px)" }}
              animate={{ filter: "blur(0px)" }}
              transition={{ duration: 0.5, ease: "easeOut" }} // durasi lebih cepat
              className="w-72 h-72 rounded-2xl overflow-hidden border-4 border-green-400 bg-neutral-900 flex items-center justify-center shadow-lg"
            >
              <img
                src={ProfileImg}
                alt="Muhammad Haidar"
                className="w-full h-full object-cover"
              />
            </motion.div>
            {/* Icon Sosial Media */}
            <div className="flex gap-4 mt-6">
              <a
                href="mailto:email@domain.com"
                className="text-green-400 hover:text-green-300 transition"
                aria-label="Email"
              >
                {/* Email Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <rect
                    width="20"
                    height="14"
                    x="2"
                    y="5"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M22 7.5 12 15 2 7.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </a>
              <a
                href="https://github.com/username"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 transition"
                aria-label="GitHub"
              >
                {/* GitHub Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.36.31.68.921.68 1.857 0 1.34-.012 2.421-.012 2.751 0 .267.18.577.688.479C19.138 20.203 22 16.447 22 12.021 22 6.484 17.523 2 12 2z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com/in/username"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 transition"
                aria-label="LinkedIn"
              >
                {/* LinkedIn Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.381-1.563 2.845-1.563 3.045 0 3.607 2.005 3.607 4.614v5.582z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Konten di kanan */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left w-full">
            {/* Nama dengan TrueFocus */}
            <TrueFocus
              sentence="Muhammad Haidar"
              blurAmount={5}
              borderColor="lime"
              glowColor="rgba(34,197,94,0.7)"
              animationDuration={0.5}
            />
            {/* SplitText untuk judul/teks putih yang lebih besar */}
            <SplitText
              text="Frontend Developer | React Enthusiast"
              className="text-white text-2xl md:text-3xl font-bold mt-6"
              splitType="words, chars"
              delay={30}
              duration={0.7}
              textAlign="center"
            />
            <SplitText
              text="Saya adalah seorang pengembang web yang fokus pada pembuatan UI modern dan interaktif menggunakan React dan Tailwind CSS."
              className="text-base md:text-lg text-green-200 max-w-2xl mt-1"
              splitType="words, chars"
              delay={10}
              duration={0.4}
              textAlign="left"
            />
            {/* Button Next */}
            <motion.button
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              whileHover={{
                scale: 1.07,
                background: "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)",
                boxShadow: "0 8px 32px 0 rgba(34,197,94,0.25)",
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/explore")}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white font-bold rounded-full shadow-lg transition-all duration-300 outline-none mt-2 focus:ring-4 focus:ring-green-400/40"
            >
              Explore
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Footer di bawah */}
      <footer className="text-green-700 text-sm text-center pb-4 mt-8 relative z-10">
        &copy; {new Date().getFullYear()} Haidar. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
