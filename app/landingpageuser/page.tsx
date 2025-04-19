"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
import "@ant-design/v5-patch-for-react-19";
import { useRouter /*useParams*/ } from "next/navigation";
import Image from "next/image";
import { Button, Col, Row, Space } from "antd";
// import { BookOutlined, CodeOutlined, GlobalOutlined } from "@ant-design/icons";
import styles from "@/styles/page.module.css";
import { useApi } from "@/hooks/useApi";
import { Match } from "@/types/match";
import SettingsPopup from "@/components/SettingsPopup";
import { useEffect, useState } from "react";
import type { UserPrivateDTO } from "@/types/user";

const LandingPageUser: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [playmat, setPlaymat] = useState("#42db83"); // default green
  const [cardback, setCardback] = useState("b101.png"); // default
  const [user, setUser] = useState<UserPrivateDTO | null>(null);

  useEffect(() => {
    const storedPlaymat = localStorage.getItem("playmat");
    const storedCardback = localStorage.getItem("cardback");
    if (storedPlaymat) setPlaymat(storedPlaymat);
    if (storedCardback) setCardback(storedCardback);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/"); // No token = send back to home
        return;
      }

      try {
        const userData = await apiService.get<UserPrivateDTO>("/users/me");
        setUser(userData);
      } catch (err: unknown) {
        console.error("Failed to fetch user data:", err);
        setUser(null);

        const error = err as { status?: number; message?: string };

        if (error.status === 401 || error.message?.includes("Invalid token")) {
          localStorage.removeItem("token");
          router.push("/");
        }
      }
    };

    fetchUser();
  }, [router, apiService]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const handleNewMatch = async () => {
    const response = await apiService.post<Match>("/matches", {
      "playerToken": localStorage.getItem("token"),
    });

    console.log(response.matchId);

    if (response && response.matchId) {
      const matchId = response.matchId.toString(); // convert bigint if needed
      router.push(`/start/${matchId}`);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
      <div className='contentContainer'>
        <Image
          src="/LandingPageCards.png"
          alt="Hearts Attack Cards"
          width={200}
          height={150}
          className={styles.cardImage}
        />

        <h1 className="luckiestGuy">HEARTS ATTACK!</h1>

        <Space direction="vertical" size="middle" style={{ marginTop: 24 }}>
          <Row gutter={16} justify="center">
            <Col>
              <Button
                block className={styles.whiteButton}
                onClick={handleNewMatch}
              >
                New Match
              </Button>
            </Col>
            <Col>
              <Button
                block className={styles.whiteButton}
                onClick={() => router.push("/join")}
              >
                Join Match
              </Button>
            </Col>
            <Col>
              <Button
                block className={styles.whiteButton}
                onClick={() => router.push("/match")}
              >
                Match Page Test
              </Button>
            </Col>
          </Row>

          <Row gutter={16} justify="center">
            <Col>
              <Button
                block className={styles.whiteButton}
                onClick={() => router.push("/leaderboard")}
              >
                Leaderboard
              </Button>
            </Col>
            {user && !user.isGuest && (
              <Col>
                <Button
                  block className={styles.whiteButton}
                  onClick={() => router.push("/friends")}
                >
                  Friends
                </Button>
              </Col>
            )}
          </Row>

          <Row gutter={16} justify="center">
            <Col>
              <Button
                block className={styles.whiteButton}
                onClick={() => router.push("/rules")}
              >
                Rules
              </Button>
            </Col>
            {user && !user.isGuest && (
              <Col>
                <Button
                  block className={styles.whiteButton}
                  onClick={() => router.push("/profile")}
                >
                  Profile
                </Button>
              </Col>
            )}
            {user && !user.isGuest && (
              <Col>
                <Button
                  block className={styles.whiteButton}
                  onClick={() => setSettingsOpen(true)}
                >
                  Settings
                </Button>
              </Col>
            )}
          </Row>
          <Row justify="center">
            {user && user.isGuest && (
              <>
                <Col>
                  <span style={{ marginLeft: "1em" }}>
                    You are logged in as a guest only.
                  </span>
                  <Button
                    block className={styles.whiteButton}
                    onClick={() => router.push("/login")}
                    style={{ marginLeft: "1em" }}
                  >
                    Login
                  </Button>
                </Col>

                <Col>
                  <Button
                    block className={styles.whiteButton}
                    onClick={() => router.push("/register")}
                    style={{ marginLeft: "1em" }}
                  >
                    Register
                  </Button>
                </Col>
              </>
            )}

            {user && !user.isGuest && (
              <Col>
                <Button
                  block className={styles.whiteButton}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </Col>
            )}
          </Row>
        </Space>

        <SettingsPopup
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          playmat={playmat}
          setPlaymat={setPlaymat}
          cardback={cardback}
          setCardback={setCardback}
        />
         </div>
      </main>
    </div>
  );
};

export default LandingPageUser;
