import { ImageResponse } from "next/og";

export const alt = "Jartides — Premium Research Peptides";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Dynamic, branded Open Graph card used as the default social/search preview
// image for every page that doesn't define its own.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0b3d7a 0%, #1a6de3 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: "0.05em" }}>
          JARTIDES
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 36,
            fontWeight: 500,
            opacity: 0.9,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
          }}
        >
          Premium Research Peptides
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 26,
            opacity: 0.85,
            display: "flex",
            gap: 24,
          }}
        >
          <span>99%+ Purity</span>
          <span>•</span>
          <span>Third-Party COAs</span>
          <span>•</span>
          <span>Worldwide Shipping</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
