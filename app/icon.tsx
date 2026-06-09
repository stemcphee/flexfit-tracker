import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#172126",
          borderRadius: 108,
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 54,
            width: 106,
            height: 106,
            borderRadius: 999,
            background: "#B4D6CD",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 54,
            width: 106,
            height: 106,
            borderRadius: 999,
            background: "#B4D6CD",
          }}
        />
        <div
          style={{
            width: 256,
            height: 128,
            borderRadius: 18,
            border: "28px solid #FAF7F0",
            borderLeftWidth: 54,
            borderRightWidth: 54,
            display: "flex",
          }}
        />
      </div>
    ),
    size,
  );
}
