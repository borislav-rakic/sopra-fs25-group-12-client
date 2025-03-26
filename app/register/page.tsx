"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useRouter } from "next/navigation"; // use NextJS router for navigation
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

const Register: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  // useLocalStorage hook example use
  // The hook returns an object with the value and two functions
  // Simply choose what you need from the hook:
  const {
    // value: token, // is commented out because we do not need the token value
    set: setToken, // we need this method to set the value of the token to the one we receive from the POST request to the backend server API
    // clear: clearToken, // is commented out because we do not need to clear the token when logging in
  } = useLocalStorage<string>("token", ""); // note that the key we are selecting is "token" and the default value we are setting is an empty string
  // if you want to pick a different token, i.e "usertoken", the line above would look as follows: } = useLocalStorage<string>("usertoken", "");

  const handleRegister = async (values: FormFieldProps) => {
    try {
      // Call the API service and let it handle JSON serialization and error handling
      const response = await apiService.post<User>("/users", values);

      // Use the useLocalStorage hook that returned a setter function (setToken in line 41) to store the token if available
      if (response.token) {
        setToken(response.token);
      }

      // Navigate to the user overview
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
        onFinish={handleRegister}
        layout="vertical"
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Create a username!" }]}
        >
          <Input placeholder="Enter new username" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Create a password!" }]}
        >
          <Input placeholder="Enter new Password" />
        </Form.Item>

        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
          <Button
            className="back-button"
            onClick={() => router.back()}
          >
            Back
          </Button>

          <Button
            htmlType="submit"
            className="login-button"
          >
            Register
          </Button>

        </div>

        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <Button type="link" onClick={() => router.push("/register")}>
            Already have an account? Login here.
          </Button>
        </div>

      </Form>
    </div>
  );
};

export default Register;
