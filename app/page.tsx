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
        <Image
          src="/LandingPageCards.png" // Replace with the actual path of your image
          alt="Hearts Attack Cards"
          width={200} // Adjust width as needed
          height={150} // Adjust height as needed
          className={styles.cardImage} // Add styling as needed in CSS
        />

        <h1>HEARTS ATTACK</h1>
        <p>
          A fast-paced card game of strategy and sabotage.<br />Can you survive
          the Hearts Attack?
        </p>
        <div className={styles.ctas}>
          <Button
            type="primary" // as defined in the ConfigProvider in [layout.tsx](./layout.tsx), all primary antd elements are colored #22426b, with buttons #75bd9d as override
            color="green" // if a single/specific antd component needs yet a different color, it can be explicitly overridden in the component as shown here
            variant="solid" // read more about the antd button and its options here: https://ant.design/components/button
            onClick={() => router.push("/login")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Login
          </Button>
          <Button
            type="primary"
            color="green"
            variant="solid"
            onClick={() => router.push("/register")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Register
          </Button>
          <Button
            type="primary"
            color="blue"
            variant="solid"
            onClick={() => handleGuestLogin()}
            target="_blank"
            rel="noopener noreferrer"
          >
            Play as Guest
          </Button>
          <Button
            type="primary"
            color="yellow"
            variant="solid"
            onClick={() => router.push("/rules")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Rules
          </Button>
        </div>
      </main>
    </div>
  );
}
