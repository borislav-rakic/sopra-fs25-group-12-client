"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
import "@ant-design/v5-patch-for-react-19";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "antd";
// import { BookOutlined, CodeOutlined, GlobalOutlined } from "@ant-design/icons";
import styles from "@/styles/page.module.css";
import { useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { User, UserAuthDTO } from "./types/user";

export default function Home() {
  const router = useRouter();
  const apiService = useApi();

  useEffect(() => {
    const checkLoginAndPopulate = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const user = await apiService.get<UserAuthDTO>("/users/me");
          if (user?.id) {
            router.push("/landingpageuser");
            return;
          }
        } catch (error: unknown) {
          const err = error as { status?: number };

          if (err.status !== 404 && err.status !== 401) {
            console.error("Unexpected error checking login:", error);
          }
        }
      }

      const developmentPhaseIsOver = false;
      if (
        !developmentPhaseIsOver ||
        !sessionStorage.getItem("populateCalled")
      ) {
        try {
          await apiService.post<void>("/leaderboard/populate", null);
          console.log("Leaderboard populated (if needed).");
          sessionStorage.setItem("populateCalled", "true");
        } catch (err) {
          console.error("Failed to populate leaderboard:", err);
        }
      }
    };

    checkLoginAndPopulate();
  }, [apiService, router]);

  const handleGuestLogin = async () => {
    try {
      const guestUser = await apiService.post<User>("/users/guest", {});
      if (guestUser.token) {
        localStorage.setItem("token", guestUser.token);
      }
      router.push("/landingpageuser");
    } catch (err) {
      console.error("Guest login failed:", err);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
      <div className='contentContainer'>
        <Image
          src="/LandingPageCards.png" // Replace with the actual path of your image
          alt="Hearts Attack Cards"
          width={275} // Adjust width as needed
          height={225} // Adjust height as needed
          className={styles.cardImage} // Add styling as needed in CSS
        />

        <h1 className="luckiestGuy"style={{ marginTop: 15 }}>HEARTS ATTACK!</h1>

        <p className='tagline'>
          A fast-paced card game of strategy & sabotage.<br />
          Can you survive the Hearts Attack?!
        </p>
        <div className={styles.ctas}>
          <Button block className={styles.whiteButton}            
            onClick={() => router.push("/login")}
          >
            Login
          </Button>
          <Button block className={styles.whiteButton}
            onClick={() => router.push("/register")}
          >
            Register
          </Button>
          <Button block className={styles.whiteButton}
            onClick={() => handleGuestLogin()}
          >
            Play as Guest
          </Button>
          <Button block className={styles.whiteButton}
            onClick={() => router.push("/rules")}
          >
            Rules
          </Button>
        </div>
        </div>
      </main>
    </div>
  );
}
