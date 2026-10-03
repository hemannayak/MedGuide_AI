import { ImageResponse } from "next/og";
export const alt = "MedGuide AI — Healthcare guidance, closer to home";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#f6f1e6",
          padding: 90,
          color: "#073d37",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, marginBottom: 55 }}>
          MedGuide AI
        </div>
        <div style={{ display: "flex", fontSize: 72 }}>
          Healthcare guidance,
        </div>
        <div style={{ display: "flex", fontSize: 72, color: "#bc5945" }}>
          closer to home.
        </div>
        <div style={{ display: "flex", fontSize: 24, marginTop: 40 }}>
          Understandable information · Multilingual access · Clear boundaries
        </div>
      </div>
    ),
    size,
  );
}
