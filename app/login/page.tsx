"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Button, Form, Input, message } from "antd";
import "@ant-design/v5-patch-for-react-19";
import "@/styles/globals.css";
import styles from "@/styles/page.module.css";

interface FormFieldProps {
  label: string;
  value: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();

  const handleLogin = async (values: FormFieldProps) => {
    try {
      const response = await apiService.post<User>("/login", values);

      if (response.token) {
        localStorage.setItem("token", response.token);
        router.push("/landingpageuser");
      } else {
        message.open({
          type: "error",
          content: "Login failed. No token returned.",
          duration: 2,
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        message.open({
          type: "error",
          content: `Login failed: ${error.message}`,
          duration: 3,
        });
      } else {
        console.error("An unknown error occurred during login.");
        message.open({
          type: "error",
          content: "An unknown error occurred during login.",
          duration: 3,
        });
      }
    }
  };

  return (
    <div className="contentContainer">
      <Form
        form={form}
        name="login"
        size="large"
        variant="outlined"
        onFinish={handleLogin}
        layout="vertical"
      >
        <Form.Item
          name="username"
          label="Username:"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password:"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password placeholder="Enter Password" />
        </Form.Item>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "5px",
            marginTop: "16px",
          }}
        >
          <Button
            block
            className={styles.whiteButton}
            onClick={() => router.push("/")}
          >
            Back
          </Button>

          <Button
            htmlType="submit"
            block
            className={styles.whiteButton}
          >
            Login
          </Button>
        </div>

        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <Button type="link" onClick={() => router.push("/register")}>
            Don&apos;t have an account? Register here.
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Login;
