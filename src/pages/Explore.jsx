import { useEffect, useRef } from "react";
import Tilt from "react-parallax-tilt";

// Komponen Squares tetap
const Squares = ({
  direction = "right",
  speed = 1,
  borderColor = "rgba(34,197,94,0.7)",
  squareSize = 40,
  hoverFillColor = "#000",
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

          if (
            hoveredSquareRef.current &&
            Math.floor((x - startX) / squareSize) === hoveredSquareRef.current.x &&
            Math.floor((y - startY) / squareSize) === hoveredSquareRef.current.y
          ) {
            ctx.fillStyle = hoverFillColor;
            ctx.fillRect(squareX, squareY, squareSize, squareSize);
          }

          ctx.save();
          ctx.shadowColor = borderColor;
          ctx.shadowBlur = 8;
          ctx.strokeStyle = borderColor;
          ctx.strokeRect(squareX, squareY, squareSize, squareSize);
          ctx.restore();
        }
      }

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

// =======================
// PORTOFOLIO PAGE MODERN
// =======================
export default function Explore() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white relative overflow-hidden font-sans">
      <Squares
        direction="right"
        speed={0.5}
        borderColor="rgba(34,197,94,0.7)"
        squareSize={40}
        hoverFillColor="#000"
      />

      {/* HEADER */}
      <header className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center pt-16 pb-8">
        <Tilt
          glareEnable={true}
          glareMaxOpacity={0.18}
          glareColor="#fff"
          glarePosition="all"
          tiltMaxAngleX={10}
          tiltMaxAngleY={10}
          scale={1.04}
          className="rounded-full shadow-xl"
        >
          <img
            src="https://ui-avatars.com/api/?name=Muhammad+Haidar&background=232526&color=34d399&size=180&bold=true"
            alt="Profile"
            className="w-40 h-40 rounded-full border-4 border-green-400 shadow-2xl object-cover bg-neutral-900"
            style={{
              boxShadow: "0 8px 32px 0 rgba(34,197,94,0.18), 0 0 0 8px #232526 inset",
            }}
          />
        </Tilt>
        <h1 className="mt-6 text-4xl md:text-5xl font-extrabold text-green-400 drop-shadow-glow tracking-tight text-center">
          Muhammad Haidar
        </h1>
        <p className="mt-2 text-xl md:text-2xl text-green-200 font-semibold text-center">
          Frontend Developer & React Enthusiast
        </p>
        <div className="flex gap-4 mt-5">
          <a
            href="mailto:haidar@email.com"
            className="text-green-400 hover:text-green-300 transition"
            aria-label="Email"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <rect width="20" height="14" x="2" y="5" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M22 7.5 12 15 2 7.5" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </a>
          <a
            href="https://github.com/username"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:text-green-300 transition"
            aria-label="GitHub"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
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
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.381-1.563 2.845-1.563 3.045 0 3.607 2.005 3.607 4.614v5.582z" />
            </svg>
          </a>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-10 w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-10 md:gap-16 px-4 pb-16">
        {/* About Me */}
        <section className="flex-1 flex flex-col justify-center">
          <Tilt
            glareEnable={true}
            glareMaxOpacity={0.12}
            glareColor="#fff"
            glarePosition="all"
            tiltMaxAngleX={8}
            tiltMaxAngleY={8}
            scale={1.01}
            className="rounded-3xl"
          >
            <div
              className="rounded-3xl p-8 md:p-10 shadow-2xl border-none backdrop-blur-md"
              style={{
                background:
                  "linear-gradient(120deg, rgba(40,40,50,0.92) 0%, #232526 40%, #e0e0e0 100%)",
                boxShadow:
                  "0 8px 32px 0 rgba(34,197,94,0.10), 0 1.5px 0 0 #fff2 inset, 0 0 0 1.5px rgba(255,255,255,0.08) inset",
                border: "1.5px solid rgba(255,255,255,0.08)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-green-300 mb-4 flex items-center gap-2">
                <svg className="w-7 h-7 text-green-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
                  <path d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4" />
                </svg>
                Tentang Saya
              </h2>
              <p className="text-base md:text-lg text-green-100 leading-relaxed mb-2">
                Saya adalah seorang <span className="text-green-400 font-semibold">Frontend Developer</span> yang fokus pada pembuatan UI modern, interaktif, dan responsif menggunakan <span className="text-green-400 font-semibold">React</span> & <span className="text-green-400 font-semibold">Tailwind CSS</span>. Saya suka membangun produk digital yang <span className="italic">clean</span>, <span className="italic">fast</span>, dan <span className="italic">user-friendly</span>.
              </p>
              <ul className="mt-4 space-y-2 text-green-200">
                <li><span className="font-semibold text-green-300">Nama:</span> Muhammad Haidar</li>
                <li><span className="font-semibold text-green-300">Domisili:</span> Bandung</li>
                <li><span className="font-semibold text-green-300">Email:</span> haidar@email.com</li>
                <li><span className="font-semibold text-green-300">Pendidikan:</span> S1 Teknik Informatika, Universitas Contoh</li>
              </ul>
            </div>
          </Tilt>
        </section>

        {/* Skills & Tools */}
        <section className="flex-1 flex flex-col justify-center">
          <Tilt
            glareEnable={true}
            glareMaxOpacity={0.12}
            glareColor="#fff"
            glarePosition="all"
            tiltMaxAngleX={8}
            tiltMaxAngleY={8}
            scale={1.01}
            className="rounded-3xl"
          >
            <div
              className="rounded-3xl p-8 md:p-10 shadow-2xl border-none backdrop-blur-md"
              style={{
                background:
                  "linear-gradient(120deg, rgba(40,40,50,0.92) 0%, #232526 40%, #e0e0e0 100%)",
                boxShadow:
                  "0 8px 32px 0 rgba(34,197,94,0.10), 0 1.5px 0 0 #fff2 inset, 0 0 0 1.5px rgba(255,255,255,0.08) inset",
                border: "1.5px solid rgba(255,255,255,0.08)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-green-300 mb-4 flex items-center gap-2">
                <svg className="w-7 h-7 text-green-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Skills & Tools
              </h2>
              <div className="flex flex-wrap gap-3 mt-2">
                <span className="bg-green-900/60 text-green-200 px-3 py-1 rounded-full text-sm font-semibold shadow">React</span>
                <span className="bg-green-900/60 text-green-200 px-3 py-1 rounded-full text-sm font-semibold shadow">Next.js</span>
                <span className="bg-green-900/60 text-green-200 px-3 py-1 rounded-full text-sm font-semibold shadow">Tailwind CSS</span>
                <span className="bg-green-900/60 text-green-200 px-3 py-1 rounded-full text-sm font-semibold shadow">JavaScript</span>
                <span className="bg-green-900/60 text-green-200 px-3 py-1 rounded-full text-sm font-semibold shadow">TypeScript</span>
                <span className="bg-green-900/60 text-green-200 px-3 py-1 rounded-full text-sm font-semibold shadow">Figma</span>
                <span className="bg-green-900/60 text-green-200 px-3 py-1 rounded-full text-sm font-semibold shadow">Git</span>
                <span className="bg-green-900/60 text-green-200 px-3 py-1 rounded-full text-sm font-semibold shadow">REST API</span>
                <span className="bg-green-900/60 text-green-200 px-3 py-1 rounded-full text-sm font-semibold shadow">Framer Motion</span>
              </div>
            </div>
          </Tilt>
        </section>
      </main>

      {/* PROJECTS */}
      <section className="relative z-10 w-full max-w-5xl mx-auto px-4 pb-20">
        <h2 className="text-2xl md:text-3xl font-bold text-green-400 mb-8 mt-8 text-center flex items-center justify-center gap-2">
          <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <path d="M3 9h18M9 21V9" />
          </svg>
          Project Pilihan
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Project Card 1 */}
          <Tilt
            glareEnable={true}
            glareMaxOpacity={0.10}
            glareColor="#fff"
            glarePosition="all"
            tiltMaxAngleX={6}
            tiltMaxAngleY={6}
            scale={1.01}
            className="rounded-2xl"
          >
            <div
              className="rounded-2xl p-6 shadow-xl border-none backdrop-blur-md flex flex-col gap-2 group transition-transform duration-300 hover:scale-[1.025]"
              style={{
                background:
                  "linear-gradient(120deg, #232526 0%, #e0e0e0 100%)",
                boxShadow:
                  "0 8px 32px 0 rgba(34,197,94,0.10), 0 1.5px 0 0 #fff2 inset",
                border: "1.5px solid rgba(255,255,255,0.08)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-block w-10 h-10 rounded-xl bg-green-900/60 flex items-center justify-center">
                  <svg className="w-7 h-7 text-green-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="4" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                </span>
                <span className="text-lg font-bold text-green-200">Modern Landing Page</span>
              </div>
              <p className="text-green-100 text-base mb-2">
                Landing page modern dengan animasi interaktif, responsive, dan dark mode. Dibangun dengan React & Tailwind CSS.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-green-900/60 text-green-200 px-2 py-0.5 rounded text-xs font-semibold">React</span>
                <span className="bg-green-900/60 text-green-200 px-2 py-0.5 rounded text-xs font-semibold">Tailwind</span>
                <span className="bg-green-900/60 text-green-200 px-2 py-0.5 rounded text-xs font-semibold">Framer Motion</span>
              </div>
              <a
                href="#"
                className="mt-3 inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-semibold transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                Lihat Demo
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </Tilt>
          {/* Project Card 2 */}
          <Tilt
            glareEnable={true}
            glareMaxOpacity={0.10}
            glareColor="#fff"
            glarePosition="all"
            tiltMaxAngleX={6}
            tiltMaxAngleY={6}
            scale={1.01}
            className="rounded-2xl"
          >
            <div
              className="rounded-2xl p-6 shadow-xl border-none backdrop-blur-md flex flex-col gap-2 group transition-transform duration-300 hover:scale-[1.025]"
              style={{
                background:
                  "linear-gradient(120deg, #232526 0%, #e0e0e0 100%)",
                boxShadow:
                  "0 8px 32px 0 rgba(34,197,94,0.10), 0 1.5px 0 0 #fff2 inset",
                border: "1.5px solid rgba(255,255,255,0.08)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-block w-10 h-10 rounded-xl bg-green-900/60 flex items-center justify-center">
                  <svg className="w-7 h-7 text-green-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4l3 3" />
                  </svg>
                </span>
                <span className="text-lg font-bold text-green-200">Dashboard Analytics</span>
              </div>
              <p className="text-green-100 text-base mb-2">
                Dashboard analitik dengan chart interaktif, filter dinamis, dan dark mode. Dibangun dengan React, Chart.js, dan Tailwind CSS.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-green-900/60 text-green-200 px-2 py-0.5 rounded text-xs font-semibold">React</span>
                <span className="bg-green-900/60 text-green-200 px-2 py-0.5 rounded text-xs font-semibold">Chart.js</span>
                <span className="bg-green-900/60 text-green-200 px-2 py-0.5 rounded text-xs font-semibold">Tailwind</span>
              </div>
              <a
                href="#"
                className="mt-3 inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-semibold transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                Lihat Demo
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </Tilt>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 w-full text-center text-green-700 text-sm pb-6">
        &copy; {new Date().getFullYear()} Muhammad Haidar. All rights reserved.
      </footer>
    </div>
  );
}