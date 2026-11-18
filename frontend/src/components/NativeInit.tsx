"use client";

import { useEffect } from "react";

export default function NativeInit() {
  useEffect(() => {
    import("@/lib/capacitor")
      .then((mod) => mod.initNative())
      .catch(() => {
        // Plain browser: nothing to initialise.
      });
  }, []);

  return null;
}
