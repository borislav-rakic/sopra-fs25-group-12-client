"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
import "@ant-design/v5-patch-for-react-19";
import { useRouter, /*useParams*/ } from "next/navigation";
import Image from "next/image";
import { Button , Row, Col, Space } from "antd";
// import { BookOutlined, CodeOutlined, GlobalOutlined } from "@ant-design/icons";
import styles from "@/styles/page.module.css";
// import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";

const LandingPageUser: React.FC = () => {
  const router = useRouter();
  const {
    // value: token, // is commented out because we dont need to know the token value for logout
    // set: setToken, // is commented out because we dont need to set or update the token value
    clear: clearToken, // all we need in this scenario is a method to clear the token
  } = useLocalStorage<string>("token", ""); // if you wanted to select a different token, i.e "lobby", useLocalStorage<string>("lobby", "");

  const handleLogout = () => {
    clearToken();
    router.push("/");
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          src="/LandingPageCards.png"
          alt="Hearts Attack Cards"
          width={200}
          height={150}
        />

        <h1>HEARTS ATTACK</h1>

        <Space direction="vertical" size="middle" style={{ marginTop: 24 }}>
          <Row gutter={16} justify="center">
            <Col>
              <Button type="primary" color="green" variant="solid" onClick={() => router.push("/start")}>
                New Match
              </Button>
            </Col>
            <Col>
              <Button type="primary" color="green" variant="solid" onClick={() => router.push("/join")}>
                Join Match
              </Button>
            </Col>
          </Row>

          <Row justify="center">
            <Col>
              <Button type="primary" color="yellow" variant="solid" onClick={() => router.push("/leaderboard")}>
                Leaderboard
              </Button>
            </Col>
          </Row>

          <Row gutter={16} justify="center">
            <Col>
              <Button type="primary" color="yellow" variant="solid" onClick={() => router.push("/rules")}>
                Rules
              </Button>
            </Col>
            <Col>
              <Button type="primary" color="yellow" variant="solid" onClick={() => router.push("/profile")}>
                Profile
              </Button>
            </Col>
            <Col>
              <Button type="primary" color="yellow" variant="solid" onClick={() => router.push("/settings")}>
                Settings
              </Button>
            </Col>
          </Row>

          <Row justify="center">
            <Col>
              <Button type="primary" color="red" variant="solid" onClick={handleLogout}>
                Logout
              </Button>
            </Col>
          </Row>
        </Space>
      </main>
    </div>
  );
};

export default LandingPageUser;