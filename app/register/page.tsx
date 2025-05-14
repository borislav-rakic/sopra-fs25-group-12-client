"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Button, Form, Input } from "antd";
import "@/styles/globals.css";
import styles from "@/styles/page.module.css";

interface FormFieldProps {
  label: string;
  value: string;
}

const Register: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();

  const handleRegister = async (values: FormFieldProps) => {
    try {
      const response = await apiService.post<User>("/users", values);

      if (response.token) {
        localStorage.setItem("token", response.token);
        // setToken(response.token);
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
    <div className="contentContainer">
      <Form
        form={form}
        name="login"
        size="large"
        variant="outlined"
        onFinish={handleRegister}
        layout="vertical"
      >
        <Form.Item
          name="username"
          label="Username:"
          rules={[
            { required: true, message: "Create a username!" },
            {
              max: 36,
              message: "Username cannot be longer than 36 characters.",
            },
            {
              min: 3,
              message: "Username must be at least 3 characters.",
            },
            {
              pattern: /^\S+$/,
              message: "Username must not contain spaces.",
            },
          ]}
        >
          <Input
            placeholder="Enter new username"
            maxLength={37}
            onChange={(e) => {
              const noSpaces = e.target.value.replace(/\s/g, "");
              form.setFieldsValue({ username: noSpaces });
            }}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password:"
          rules={[{ required: true, message: "Create a password!" }, {
            pattern: /^\S+$/,
            message: "Password must not contain spaces.",
          }]}
        >
          <Input
            type="password"
            placeholder="Enter new Password"
            onChange={(e) => {
              const noSpaces = e.target.value.replace(/\s/g, "");
              form.setFieldsValue({ password: noSpaces });
            }}
          />
        </Form.Item>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "10px",
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
            Register
          </Button>
        </div>

        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <Button type="link" onClick={() => router.push("/login")}>
            Already have an account? Login here.
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Register;
