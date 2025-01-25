"use client";

import React, { useRef, useEffect } from 'react';
import animationData from "@/public/Json/Login.json";

const Authform = () => {
  const ref = useRef(null);

  useEffect(() => {
    import("@lottiefiles/lottie-player");
  }, []);

  return (
    <>
      <lottie-player
        id="auth"
        ref={ref}
        autoplay
        loop
        mode="normal"
        src={JSON.stringify(animationData)}
      ></lottie-player>
    </>
  );
}

export default Authform;
