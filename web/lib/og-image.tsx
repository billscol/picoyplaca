import { ImageResponse } from "next/og";

const ZAP_PATH =
  "M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z";

function ZapIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d={ZAP_PATH} />
    </svg>
  );
}

export const ogImageSize = { width: 1200, height: 630 };
export const ogImageContentType = "image/png";

interface OgImageCopy {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export function renderOgImage({ eyebrow, title, subtitle }: OgImageCopy) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #000000 0%, #181818 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 20,
              background: "#cafc00",
            }}
          >
            <ZapIcon size={32} color="#000000" />
          </div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: "#ffffff", letterSpacing: -0.5 }}>
            Pico y Placa
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 1000 }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "8px 20px",
              borderRadius: 999,
              background: "rgba(202,252,0,0.16)",
              color: "#cafc00",
              fontSize: 26,
              fontWeight: 600,
            }}
          >
            {eyebrow}
          </div>
          <div style={{ display: "flex", fontSize: 66, fontWeight: 800, color: "#ffffff", lineHeight: 1.08, letterSpacing: -1.5 }}>
            {title}
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#a3a3a3", lineHeight: 1.4 }}>{subtitle}</div>
        </div>
      </div>
    ),
    { ...ogImageSize }
  );
}
