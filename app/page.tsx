"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
import "@ant-design/v5-patch-for-react-19";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "antd";
// import { BookOutlined, CodeOutlined, GlobalOutlined } from "@ant-design/icons";
import styles from "@/styles/page.module.css";
import { useEffect } from "react";
import { useApi } from "@/hooks/useApi";

export default function Home() {
  const router = useRouter();
  const apiService = useApi();

  useEffect(() => {
    console.log("look at populate called");
    if (!sessionStorage.getItem("populateCalled")) {
      apiService.post<void>("/leaderboard/populate", null)
        .then(() => {
          console.log("Leaderboard populated (if needed).");
        })
        .catch((err) => {
          console.error("Failed to populate leaderboard:", err);
        });

      sessionStorage.setItem("populateCalled", "true");
    }
  }, [apiService]);

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
            onClick={() => router.push("/landingpageuser")}
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
