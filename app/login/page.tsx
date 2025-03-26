"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input } from "antd";
import "@/styles/globals.css"; 
// import styles from "@/styles/page.module.css";

interface FormFieldProps {
  label: string;
  value: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  
  const {
    set: setToken,
  } = useLocalStorage<string>("token", "");

  const handleLogin = async (values: FormFieldProps) => {
    try {

      const response = await apiService.post<User>("/login", values);

      if (response.token) {
        setToken(response.token);
      }

      router.push("/landingpageuser");

    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong during the login:\n${error.message}`);
      } else {
        console.error("An unknown error occurred during login.");
      }
    }
  };

  return (
    <div className="login-container">
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
          <Input placeholder="Enter Password" />
        </Form.Item>

        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
          <Button
            className="back-button"
            onClick={() => router.push("/")}
          >
            Back
          </Button>

          <Button
            htmlType="submit"
            className="login-button"
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
