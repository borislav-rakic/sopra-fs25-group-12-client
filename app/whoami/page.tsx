"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const WhoAmI: React.FC = () => {
  const { user, isLoggedIn, loading } = useAuth();
  const router = useRouter();

  // Redirect if not logged in (after loading finishes)
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/");
    }
  }, [loading, isLoggedIn, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return <div>Loading...</div>;
  }

  // Authenticated state
  return (
    <div>
      <h1>Welcome back, {user?.username}!</h1>
      <p>Status: {user?.status}</p>
      <p>Birthday: {user?.birthday}</p>
      <p>Rating: {user?.rating}</p>
    </div>
  );
};

export default WhoAmI;
