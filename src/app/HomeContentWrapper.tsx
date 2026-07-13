"use client";

import { useEffect, useState } from "react";
import HomeContent from "./HomeContent";

export default function HomeContentWrapper({ blogPosts = [], guidePosts = [] }: { blogPosts?: any[], guidePosts?: any[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Hydration mismatch 방지

  return <HomeContent blogPosts={blogPosts} guidePosts={guidePosts} />;
}
