import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Rubul Islam — Full Stack Developer (MERN)";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generated at build time; used for Open Graph and Twitter previews.
export default async function OpengraphImage() {
  const photo = await readFile(join(process.cwd(), "public/images/rubul-islam.jpg"));
  const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#09090B",
          backgroundImage:
            "radial-gradient(circle at 85% 10%, rgba(139,92,246,0.30), transparent 45%), radial-gradient(circle at 10% 100%, rgba(96,165,250,0.12), transparent 40%)",
          color: "#FAFAFA",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 18px",
                borderRadius: "999px",
                border: "2px solid rgba(74,222,128,0.35)",
                background: "rgba(74,222,128,0.10)",
                color: "#4ADE80",
                fontSize: "22px",
              }}
            >
              <div style={{ width: "12px", height: "12px", borderRadius: "999px", background: "#4ADE80" }} />
              Available for work
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "96px", fontWeight: 800, lineHeight: 0.95, letterSpacing: "-4px" }}>RUBUL</div>
            <div style={{ fontSize: "96px", fontWeight: 800, lineHeight: 0.95, letterSpacing: "-4px" }}>ISLAM</div>
            <div style={{ marginTop: "28px", fontSize: "36px", color: "#A78BFA", fontWeight: 600 }}>
              Full Stack Developer (MERN)
            </div>
          </div>

          <div style={{ display: "flex", fontSize: "24px", color: "#A1A1AA" }}>
            React · Node.js · Express · MongoDB — Guwahati, India
          </div>
        </div>

        <div style={{ display: "flex", padding: "48px 48px 48px 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse only supports <img> */}
          <img
            src={photoSrc}
            alt=""
            width={420}
            height={534}
            style={{ objectFit: "cover", objectPosition: "50% 18%", borderRadius: "36px", border: "2px solid #2A2A31" }}
          />
        </div>
      </div>
    ),
    size,
  );
}
