import dynamic from "next/dynamic";

// Phaser requires browser APIs — never render on the server
const PlatformerGame = dynamic(
  () => import("@/components/PlatformerGame/PlatformerGame"),
  { ssr: false }
);

export default function Page() {
  return <PlatformerGame />;
}
