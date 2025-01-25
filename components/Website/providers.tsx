"use client";

import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";


export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  
  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <ToasterProvider />
    </ThemeProvider>
  );
}

function ToasterProvider() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      position="top-right"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
    />
  );
}
