import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import SplitText from "../components/SplitText";
import { Renderer, Program, Mesh, Triangle, Color, Camera, Transform, Plane, Texture } from "ogl";
import ProfileImg from "../assets/image/Profile.png";
import BahanBakarImg from "../assets/image/Bahan Bakar.png";
import DataSiswaImg from "../assets/image/Data Siswa.png";
import KalkulatorImg from "../assets/image/Kalkulator sederhana.png";
import KasirImg from "../assets/image/Kasir.png";
import RentalMotorImg from "../assets/image/Rental Motor.png";
import WebshopImg from "../assets/image/Webshop.png";
import MyLibraryImg from "../assets/image/MyLibrary.png";
import TicketingMobileAppImg from "../assets/image/Ticketing-MobileApp.png";
import WeatherDetectorImg from "../assets/image/WeatherDetector.png";
import UnityImg from "../assets/image/UNITY.png";
import DicodingImg from "../assets/image/Dicoding.png";

// Threads background component
const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;
uniform float iTime;
uniform vec3 iResolution;
uniform vec3 uColor;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;
#define PI 3.1415926538
const int u_line_count = 40;
const float u_line_width = 7.0;
const float u_line_blur = 10.0;
float Perlin2D(vec2 P) {
    vec2 Pi = floor(P);
    vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
    vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
    Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
    Pt += vec2(26.0, 161.0).xyxy;
    Pt *= Pt;
    Pt = Pt.xzxz * Pt.yyww;
    vec4 hash_x = fract(Pt * (1.0 / 951.135664));
    vec4 hash_y = fract(Pt * (1.0 / 642.949883));
    vec4 grad_x = hash_x - 0.49999;
    vec4 grad_y = hash_y - 0.49999;
    vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y)
        * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
    grad_results *= 1.4142135623730950;
    vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy
               * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
    vec4 blend2 = vec4(blend, vec2(1.0 - blend));
    return dot(grad_results, blend2.zxzx * blend2.wwyy);
}
float pixel(float count, vec2 resolution) {
    return (1.0 / max(resolution.x, resolution.y)) * count;
}
float lineFn(vec2 st, float width, float perc, float offset, vec2 mouse, float time, float amplitude, float distance) {
    float split_offset = (perc * 0.4);
    float split_point = 0.1 + split_offset;
    float amplitude_normal = smoothstep(split_point, 0.7, st.x);
    float amplitude_strength = 0.5;
    float finalAmplitude = amplitude_normal * amplitude_strength
                           * amplitude * (1.0 + (mouse.y - 0.5) * 0.2);
    float time_scaled = time / 10.0 + (mouse.x - 0.5) * 1.0;
    float blur = smoothstep(split_point, split_point + 0.05, st.x) * perc;
    float xnoise = mix(
        Perlin2D(vec2(time_scaled, st.x + perc) * 2.5),
        Perlin2D(vec2(time_scaled, st.x + time_scaled) * 3.5) / 1.5,
        st.x * 0.3
    );
    float y = 0.5 + (perc - 0.5) * distance + xnoise / 2.0 * finalAmplitude;
    float line_start = smoothstep(
        y + (width / 2.0) + (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        y,
        st.y
    );
    float line_end = smoothstep(
        y,
        y - (width / 2.0) - (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        st.y
    );
    return clamp(
        (line_start - line_end) * (1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3))),
        0.0,
        1.0
    );
}
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    float line_strength = 1.0;
    for (int i = 0; i < u_line_count; i++) {
        float p = float(i) / float(u_line_count);
        line_strength *= (1.0 - lineFn(
            uv,
            u_line_width * pixel(1.0, iResolution.xy) * (1.0 - p),
            p,
            (PI * 1.0) * p,
            uMouse,
            iTime,
            uAmplitude,
            uDistance
        ));
    }
    float colorVal = 1.0 - line_strength;
    fragColor = vec4(uColor * colorVal, colorVal);
}
void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

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

// TrueFocus: animasi border langsung ke seluruh nama (Muhammad Haidar) dengan dua baris
const TrueFocus = ({
  blurAmount = 5,
  borderColor = "lime",
  glowColor = "rgba(34,197,94,0.7)",
  animationDuration = 0.5,
}) => {
  // Dua baris: Muhammad (hijau), Haidar (putih)
  const firstName = "Muhammad";
  const lastName = "Haidar";
  const containerRef = useRef(null);
  const wordRefs = useRef([]);
  const [focusRect, setFocusRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !wordRefs.current[0] || !wordRefs.current[1]) return;
    const parentRect = containerRef.current.getBoundingClientRect();
    const firstRect = wordRefs.current[0].getBoundingClientRect();
    const lastRect = wordRefs.current[1].getBoundingClientRect();

    // Ambil area dari atas Muhammad sampai bawah Haidar, dan lebar terlebar
    const left = Math.min(firstRect.left, lastRect.left);
    const right = Math.max(firstRect.right, lastRect.right);
    setFocusRect({
      x: left - parentRect.left,
      y: firstRect.top - parentRect.top,
      width: right - left,
      height: lastRect.bottom - firstRect.top,
    });
    setShow(true);
  }, []);

  return (
    <div
      className="relative flex flex-col items-start"
      ref={containerRef}
    >
      <span
        ref={el => (wordRefs.current[0] = el)}
        className="relative font-black"
        style={{
          color: "rgba(34,197,94,0.7)",
          fontSize: "3.2rem",
          lineHeight: 1.1,
          filter: show ? "blur(0px)" : `blur(${blurAmount}px)`,
          "--border-color": borderColor,
          "--glow-color": glowColor,
          transition: `filter ${animationDuration}s ease`,
        }}
      >
        {firstName}
      </span>
      <span
        ref={el => (wordRefs.current[1] = el)}
        className="relative text-white font-black"
        style={{
          fontSize: "3.2rem",
          lineHeight: 1.1,
          filter: show ? "blur(0px)" : `blur(${blurAmount}px)`,
          "--border-color": borderColor,
          "--glow-color": glowColor,
          transition: `filter ${animationDuration}s ease`,
        }}
      >
        {lastName}
      </span>
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
        {/* Keempat sudut hijau */}
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

const SkillItem = ({ icon, label }) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 mb-2">{icon}</div>
      <span className="text-sm font-medium text-white">{label}</span>
    </div>
  );
};

export default function About() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImg, setModalImg] = useState(null);

  const openModal = (img) => {
    setModalImg(img);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalImg(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-4 relative overflow-hidden" style={{ background: "#000" }}>
      {/* Modal Sertifikat */}
      {modalOpen && (
        <>
          {/* Overlay blur */}
          <div className="fixed inset-0 z-40 backdrop-blur-[6px] bg-black/60 transition-all"></div>
          {/* Modal Sertifikat */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={closeModal}
          >
            <div className="relative">
              {/* Tombol X */}
              <button
                onClick={closeModal}
                className="absolute -top-4 -right-4 bg-green-400 text-black rounded-full w-9 h-9 flex items-center justify-center shadow-lg hover:bg-green-500 transition z-10"
                aria-label="Tutup"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img
                src={modalImg}
                alt="Sertifikat"
                className="max-w-full max-h-[90vh] rounded-2xl border-4 border-green-400 shadow-2xl bg-neutral-900"
                onClick={e => e.stopPropagation()}
              />
            </div>
          </div>
        </>
      )}
      {/* Animated background */}
      <Squares
        direction="right"
        speed={0.5}
        borderColor="rgba(34,197,94,0.7)"
        squareSize={40}
        hoverFillColor="#000"
      />
      {/* Konten utama */}
      <div className="relative z-10 flex items-center justify-start min-h-[80vh]">
        <div className="flex flex-col md:flex-row items-center md:items-center gap-12 w-full max-w-5xl mx-auto md:ml-0 ml-0">
          {/* Profile Card dan Konten Kanan */}
          <div className="flex flex-col items-center w-full md:w-auto">
            <motion.div
              initial={{ filter: "blur(18px)" }}
              animate={{ filter: "blur(0px)" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
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
                href="https://mail.google.com/mail/u/0/?view=cm&tf=1&fs=1&to=mhmmdHaidar1138@gmail.com"
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
                href="https://github.com/MuhammadHaidar1138"
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
                href="https://linkedin.com/in/userhttps://www.linkedin.com/in/muhammad-haidar-7102ba341/name"
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
          <div className="flex flex-col items-start text-left w-full">
            {/* Nama dengan TrueFocus */}
            <TrueFocus
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
              textAlign="left"
            />
            <SplitText
              text="Saya adalah seorang pengembang web yang fokus pada pembuatan UI modern dan interaktif menggunakan React dan Tailwind CSS."
              className="text-base md:text-lg text-green-200 max-w-2xl mt-1"
              splitType="words, chars"
              delay={10}
              duration={0.4}
              textAlign="left"
            />
          </div>
        </div>
      </div>
      {/* Spacer agar skill card lebih ke bawah */}
      <div className="h-16 md:h-24"></div>
      {/* Card Skill Section */}
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 flex justify-center mt-10"
      >
        <div className="bg-neutral-900/90 border-4 border-green-400 rounded-3xl shadow-2xl px-12 py-12 flex flex-col items-center max-w-5xl w-full">
          <h2 className="text-green-400 text-2xl font-bold mb-8 text-center tracking-wide">My Skills</h2>
          <div className="grid grid-cols-4 grid-rows-2 gap-10 w-full justify-items-center">
            <SkillItem
              icon={
                <svg viewBox="0 0 128 128" width="48" height="48"><path fill="#E44D26" d="M19.5 114.5L8.8 0h110.4l-10.7 114.5L63.9 128" /><path fill="#F16529" d="M64 117.2l35.1-9.7 9.2-103.2H64" /><path fill="#EBEBEB" d="M64 52.1H44.2l-1.3-14.7H64V23.1H28.7l.3 3.7 3.4 38.5H64zm0 37.2l-.1.1-16.2-4.4-1-11.2H32.9l2 22.4 29 8 .1-.1z" /><path fill="#FFF" d="M63.9 52.1V37.4h18.6l1.3-14.3H63.9V8.2h35.2l-.3 3.7-3.4 38.5zm0 37.2v13.1l16.2-4.4 1-11.2h13.8l-2 22.4-29 8z" /></svg>
              }
              label="HTML"
            />
            <SkillItem
              icon={
                <svg viewBox="0 0 128 128" width="48" height="48"><path fill="#1572B6" d="M19.5 114.5L8.8 0h110.4l-10.7 114.5L63.9 128" /><path fill="#33A9DC" d="M64 117.2l35.1-9.7 9.2-103.2H64" /><path fill="#fff" d="M64 52.1H44.2l-1.3-14.7H64V23.1H28.7l.3 3.7 3.4 38.5H64zm0 37.2l-.1.1-16.2-4.4-1-11.2H32.9l2 22.4 29 8 .1-.1z" /><path fill="#EBEBEB" d="M63.9 52.1V37.4h18.6l1.3-14.3H63.9V8.2h35.2l-.3 3.7-3.4 38.5zm0 37.2v13.1l16.2-4.4 1-11.2h13.8l-2 22.4-29 8z" /></svg>
              }
              label="CSS"
            />
            <SkillItem
              icon={
                <svg viewBox="0 0 128 128" width="48" height="48"><path fill="#777BB4" d="M64 0C28.7 0 0 28.7 0 64c0 35.3 28.7 64 64 64s64-28.7 64-64C128 28.7 99.3 0 64 0zm0 120c-30.9 0-56-25.1-56-56s25.1-56 56-56 56 25.1 56 56-25.1 56-56 56z" /><path fill="#fff" d="M64 24c-22.1 0-40 17.9-40 40s17.9 40 40 40 40-17.9 40-40-17.9-40-40-40zm0 72c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z" /></svg>
              }
              label="PHP"
            />
            <SkillItem
              icon={
                <svg viewBox="0 0 128 128" width="48" height="48"><path fill="#F55247" d="M64 0C28.7 0 0 28.7 0 64c0 35.3 28.7 64 64 64s64-28.7 64-64C128 28.7 99.3 0 64 0zm0 120c-30.9 0-56-25.1-56-56s25.1-56 56-56 56 25.1 56 56-25.1 56-56 56z" /><path fill="#fff" d="M64 24c-22.1 0-40 17.9-40 40s17.9 40 40 40 40-17.9 40-40-17.9-40-40-40zm0 72c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z" /></svg>
              }
              label="Laravel"
            />
            <SkillItem
              icon={
                <svg viewBox="0 0 128 128" width="48" height="48"><g fill="#61DAFB"><circle cx="64" cy="64" r="11.4" /><path d="M64 0C28.7 0 0 28.7 0 64c0 35.3 28.7 64 64 64s64-28.7 64-64C128 28.7 99.3 0 64 0zm0 120c-30.9 0-56-25.1-56-56s25.1-56 56-56 56 25.1 56 56-25.1 56-56 56z" /><ellipse cx="64" cy="64" rx="56" ry="22" fill="none" stroke="#61DAFB" strokeWidth="8" /><ellipse cx="64" cy="64" rx="22" ry="56" fill="none" stroke="#61DAFB" strokeWidth="8" transform="rotate(60 64 64)" /><ellipse cx="64" cy="64" rx="22" ry="56" fill="none" stroke="#61DAFB" strokeWidth="8" transform="rotate(120 64 64)" /></g></svg>
              }
              label="ReactJS"
            />
            <SkillItem
              icon={
                <svg viewBox="0 0 128 128" width="48" height="48"><circle cx="64" cy="64" r="56" fill="#f5c518" /><text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="40" fill="#222">Lu</text></svg>
              }
              label="Lumen"
            />
            <SkillItem
              icon={
                <svg viewBox="0 0 128 128" width="48" height="48"><rect width="128" height="128" rx="24" fill="#38BDF8" /><path d="M32 96l32-64 32 64H32z" fill="#fff" /></svg>
              }
              label="Tailwind"
            />
            <SkillItem
              icon={
                <svg viewBox="0 0 128 128" width="48" height="48"><rect width="128" height="128" rx="24" fill="#7952B3" /><text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="40" fill="#fff">B</text></svg>
              }
              label="Bootstrap"
            />
          </div>
        </div>
      </motion.div>
      {/* Section Pendidikan */}
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 flex justify-center mt-20"
      >
        <div className="w-full max-w-4xl px-4">
          <h2 className="text-green-400 text-2xl font-bold mb-10 text-center tracking-wide">
            Pendidikan
          </h2>
          <div className="flex flex-col gap-8">
            {/* SD */}
            <div className="flex items-center group">
              <div className="flex flex-col items-center mr-6">
                <div className="w-6 h-6 rounded-full bg-green-400 border-4 border-neutral-900 shadow-lg group-hover:scale-110 transition" />
                <div className="w-1 h-20 bg-gradient-to-b from-green-400 to-transparent" />
              </div>
              <div className="bg-neutral-900/90 border border-green-400 rounded-xl shadow-lg px-8 py-6 flex-1 transition group-hover:scale-[1.03]">
                <h3 className="text-lg font-bold text-green-300 mb-1">SDN Bendungan 1</h3>
                <p className="text-green-100 text-sm mb-1">2015 - 2020</p>
              </div>
            </div>
            {/* SMP */}
            <div className="flex items-center group">
              <div className="flex flex-col items-center mr-6">
                <div className="w-6 h-6 rounded-full bg-green-400 border-4 border-neutral-900 shadow-lg group-hover:scale-110 transition" />
                <div className="w-1 h-20 bg-gradient-to-b from-green-400 to-transparent" />
              </div>
              <div className="bg-neutral-900/90 border border-green-400 rounded-xl shadow-lg px-8 py-6 flex-1 transition group-hover:scale-[1.03]">
                <h3 className="text-lg font-bold text-green-300 mb-1">SMP PGRI 1 Ciawi</h3>
                <p className="text-green-100 text-sm mb-1">2020 - 2023</p>
              </div>
            </div>
            {/* SMK */}
            <div className="flex items-center group">
              <div className="flex flex-col items-center mr-6">
                <div className="w-6 h-6 rounded-full bg-green-400 border-4 border-neutral-900 shadow-lg group-hover:scale-110 transition" />
                {/* Tidak ada garis bawah untuk terakhir */}
              </div>
              <div className="bg-neutral-900/90 border border-green-400 rounded-xl shadow-lg px-8 py-6 flex-1 transition group-hover:scale-[1.03]">
                <h3 className="text-lg font-bold text-green-300 mb-1">SMK Wikrama Bogor</h3>
                <p className="text-green-100 text-sm mb-1">2023 - 2026</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      {/* Section Sertifikat */}
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 flex justify-center mt-20"
      >
        <div className="w-full max-w-5xl px-4">
          <h2 className="text-green-400 text-2xl font-bold mb-10 text-center tracking-wide">
            Sertifikat
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sertifikat Card 1 */}
            <motion.div
              whileHover={{ scale: 1.04, boxShadow: "0 8px 32px 0 rgba(34,197,94,0.25)" }}
              className="bg-neutral-900/90 border-2 border-green-400 rounded-2xl shadow-xl p-6 flex flex-col items-center transition cursor-pointer"
              onClick={() => openModal(DicodingImg)}
            >
              <img
                src={DicodingImg}
                alt="Sertifikat Dicoding"
                className="w-28 h-28 object-cover rounded-xl mb-4 border-2 border-green-400 shadow"
              />
              <h3 className="text-lg font-bold text-green-300 mb-1 text-center">Dicoding</h3>
              <p className="text-green-100 text-sm mb-2 text-center">Belajar Dasar Pemrograman Web</p>
            </motion.div>
            {/* Sertifikat Card 2 */}
            <motion.div
              whileHover={{ scale: 1.04, boxShadow: "0 8px 32px 0 rgba(34,197,94,0.25)" }}
              className="bg-neutral-900/90 border-2 border-green-400 rounded-2xl shadow-xl p-6 flex flex-col items-center transition cursor-pointer"
              onClick={() => openModal(UnityImg)}
            >
              <img
                src={UnityImg}
                alt="Sertifikat Unity"
                className="w-28 h-28 object-cover rounded-xl mb-4 border-2 border-green-400 shadow"
              />
              <h3 className="text-lg font-bold text-green-300 mb-1 text-center">UNITY</h3>
              <p className="text-green-100 text-sm mb-2 text-center">Unity Essentials Pathway </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Section Project */}
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 flex justify-center mt-20"
      >
        <div className="w-full max-w-5xl px-4">
          <h2 className="text-green-400 text-2xl font-bold mb-10 text-center tracking-wide">
            Project
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Project Card 1 */}
            <motion.div
              whileHover={{ scale: 1.03, boxShadow: "0 8px 32px 0 rgba(34,197,94,0.25)" }}
              className="bg-gradient-to-br from-green-900/60 to-neutral-900/90 border-2 border-green-400 rounded-2xl shadow-xl p-6 flex flex-col md:flex-row gap-6 items-center transition"
            >
              <img
                src={BahanBakarImg}
                alt="Bahan Bakar"
                className="w-32 h-32 object-cover rounded-xl border-2 border-green-400 shadow"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-300 mb-1">Bahan Bakar</h3>
                <a
                  href="https://github.com/MuhammadHaidar1138/Bahan-Bakar" // ganti sesuai repo
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 mt-2 text-green-400 hover:text-green-300 underline underline-offset-4 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.36.31.68.921.68 1.857 0 1.34-.012 2.421-.012 2.751 0 .267.18.577.688.479C19.138 20.203 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/>
                  </svg>
                  <span className="hidden md:inline">Repository</span>
                </a>
              </div>
            </motion.div>
            {/* Project Card 2 */}
            <motion.div
              whileHover={{ scale: 1.03, boxShadow: "0 8px 32px 0 rgba(34,197,94,0.25)" }}
              className="bg-gradient-to-br from-green-900/60 to-neutral-900/90 border-2 border-green-400 rounded-2xl shadow-xl p-6 flex flex-col md:flex-row gap-6 items-center transition"
            >
              <img
                src={DataSiswaImg}
                alt="Data Siswa"
                className="w-32 h-32 object-cover rounded-xl border-2 border-green-400 shadow"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-300 mb-1">Data Siswa</h3>
                <a
                  href="https://github.com/MuhammadHaidar1138/Data-Siswa" // ganti sesuai repo
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 mt-2 text-green-400 hover:text-green-300 underline underline-offset-4 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.36.31.68.921.68 1.857 0 1.34-.012 2.421-.012 2.751 0 .267.18.577.688.479C19.138 20.203 22 16.447 22 12.021 22 6.484 17.523 2 12 2z" />
                  </svg>
                  <span className="hidden md:inline">Repository</span>
                </a>
              </div>
            </motion.div>
            {/* Project Card 3 */}
            <motion.div
              whileHover={{ scale: 1.03, boxShadow: "0 8px 32px 0 rgba(34,197,94,0.25)" }}
              className="bg-gradient-to-br from-green-900/60 to-neutral-900/90 border-2 border-green-400 rounded-2xl shadow-xl p-6 flex flex-col md:flex-row gap-6 items-center transition"
            >
              <img
                src={KalkulatorImg}
                alt="Kalkulator Sederhana"
                className="w-32 h-32 object-cover rounded-xl border-2 border-green-400 shadow"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-300 mb-1">Kalkulator Sederhana</h3>
              </div>
            </motion.div>
            {/* Project Card 4 */}
            <motion.div
              whileHover={{ scale: 1.03, boxShadow: "0 8px 32px 0 rgba(34,197,94,0.25)" }}
              className="bg-gradient-to-br from-green-900/60 to-neutral-900/90 border-2 border-green-400 rounded-2xl shadow-xl p-6 flex flex-col md:flex-row gap-6 items-center transition"
            >
              <img
                src={KasirImg}
                alt="Kasir"
                className="w-32 h-32 object-cover rounded-xl border-2 border-green-400 shadow"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-300 mb-1">Kasir</h3>
                <a
                  href="https://github.com/MuhammadHaidar1138/Kasir" // ganti sesuai repo
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 mt-2 text-green-400 hover:text-green-300 underline underline-offset-4 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.36.31.68.921.68 1.857 0 1.34-.012 2.421-.012 2.751 0 .267.18.577.688.479C19.138 20.203 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/>
                  </svg>
                  <span className="hidden md:inline">Repository</span>
                </a>
              </div>
            </motion.div>
            {/* Project Card 5 */}
            <motion.div
              whileHover={{ scale: 1.03, boxShadow: "0 8px 32px 0 rgba(34,197,94,0.25)" }}
              className="bg-gradient-to-br from-green-900/60 to-neutral-900/90 border-2 border-green-400 rounded-2xl shadow-xl p-6 flex flex-col md:flex-row gap-6 items-center transition"
            >
              <img
                src={RentalMotorImg}
                alt="Rental Motor"
                className="w-32 h-32 object-cover rounded-xl border-2 border-green-400 shadow"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-300 mb-1">Rental Motor</h3>
                <a
                  href="https://github.com/MuhammadHaidar1138/Rental-Motor" // ganti sesuai repo
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 mt-2 text-green-400 hover:text-green-300 underline underline-offset-4 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.36.31.68.921.68 1.857 0 1.34-.012 2.421-.012 2.751 0 .267.18.577.688.479C19.138 20.203 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/>
                  </svg>
                  <span className="hidden md:inline">Repository</span>
                </a>
              </div>
            </motion.div>
            {/* Project Card 6 */}
            <motion.div
              whileHover={{ scale: 1.03, boxShadow: "0 8px 32px 0 rgba(34,197,94,0.25)" }}
              className="bg-gradient-to-br from-green-900/60 to-neutral-900/90 border-2 border-green-400 rounded-2xl shadow-xl p-6 flex flex-col md:flex-row gap-6 items-center transition"
            >
              <img
                src={WebshopImg}
                alt="Webshop"
                className="w-32 h-32 object-cover rounded-xl border-2 border-green-400 shadow"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-300 mb-1">Webshop</h3>
                <a
                  href="https://github.com/MuhammadHaidar1138/Haidar.Webshop" // ganti sesuai repo
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 mt-2 text-green-400 hover:text-green-300 underline underline-offset-4 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.36.31.68.921.68 1.857 0 1.34-.012 2.421-.012 2.751 0 .267.18.577.688.479C19.138 20.203 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/>
                  </svg>
                  <span className="hidden md:inline">Repository</span>
                </a>
              </div>
            </motion.div>
            {/* Project Card 7 */}
            <motion.div
              whileHover={{ scale: 1.03, boxShadow: "0 8px 32px 0 rgba(34,197,94,0.25)" }}
              className="bg-gradient-to-br from-green-900/60 to-neutral-900/90 border-2 border-green-400 rounded-2xl shadow-xl p-6 flex flex-col md:flex-row gap-6 items-center transition"
            >
              <img
                src={MyLibraryImg}
                alt="MyLibrary"
                className="w-32 h-32 object-cover rounded-xl border-2 border-green-400 shadow"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-300 mb-1">MyLibrary</h3>
                <a
                  href="https://github.com/MuhammadHaidar1138/MyLibrary-App" // ganti sesuai repo
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 mt-2 text-green-400 hover:text-green-300 underline underline-offset-4 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.36.31.68.921.68 1.857 0 1.34-.012 2.421-.012 2.751 0 .267.18.577.688.479C19.138 20.203 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/>
                  </svg>
                  <span className="hidden md:inline">Repository</span>
                </a>
              </div>
            </motion.div>
            {/* Project Card 8 */}
            <motion.div
              whileHover={{ scale: 1.03, boxShadow: "0 8px 32px 0 rgba(34,197,94,0.25)" }}
              className="bg-gradient-to-br from-green-900/60 to-neutral-900/90 border-2 border-green-400 rounded-2xl shadow-xl p-6 flex flex-col md:flex-row gap-6 items-center transition"
            >
              <img
                src={TicketingMobileAppImg}
                alt="Ticketing Mobile App"
                className="w-32 h-32 object-cover rounded-xl border-2 border-green-400 shadow"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-300 mb-1">Ticketing Mobile App</h3>
                <a
                  href="https://github.com/MuhammadHaidar1138/Ticketing-MobileApp" // ganti sesuai repo
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 mt-2 text-green-400 hover:text-green-300 underline underline-offset-4 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.36.31.68.921.68 1.857 0 1.34-.012 2.421-.012 2.751 0 .267.18.577.688.479C19.138 20.203 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/>
                  </svg>
                  <span className="hidden md:inline">Repository</span>
                </a>
              </div>
            </motion.div>
            {/* Project Card 9 */}
            <motion.div
              whileHover={{ scale: 1.03, boxShadow: "0 8px 32px 0 rgba(34,197,94,0.25)" }}
              className="bg-gradient-to-br from-green-900/60 to-neutral-900/90 border-2 border-green-400 rounded-2xl shadow-xl p-6 flex flex-col md:flex-row gap-6 items-center transition"
            >
              <img
                src={WeatherDetectorImg}
                alt="Weather Detector"
                className="w-32 h-32 object-cover rounded-xl border-2 border-green-400 shadow"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-300 mb-1">Weather Detector</h3>
                <a
                  href="https://github.com/MuhammadHaidar1138/WeatherDetector-App" // ganti sesuai repo
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 mt-2 text-green-400 hover:text-green-300 underline underline-offset-4 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.36.31.68.921.68 1.857 0 1.34-.012 2.421-.012 2.751 0 .267.18.577.688.479C19.138 20.203 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/>
                  </svg>
                  <span className="hidden md:inline">Repository</span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Footer di bawah */}
      <footer className="text-green-700 text-sm text-center pb-4 mt-8 relative z-10">
        &copy; {new Date().getFullYear()} Haidar. All rights reserved.
      </footer>
    </div>
  );
}