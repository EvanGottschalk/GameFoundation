"use client";

import { useEffect, useRef } from "react";

export default function PlatformerGame() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let game: { destroy: (removeCanvas: boolean) => void } | null = null;
    let cancelled = false;

    // Dynamic import keeps Phaser out of the server bundle entirely
    import("./game/createGame").then(({ createGame }) => {
      if (cancelled || !containerRef.current) return;
      game = createGame(containerRef.current);
    });

    return () => {
      cancelled = true;
      game?.destroy(true);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
    />
  );
}
