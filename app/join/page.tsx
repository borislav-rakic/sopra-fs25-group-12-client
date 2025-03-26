"use client";

import { useRouter } from "next/navigation";
import { Form, Input, Button } from "antd";
import "@/styles/globals.css";
// import styles from "@/styles/page.module.css";

const JoinPage: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm();

  return (
    <div className="login-container">
      <Form
        form={form}
        name="join"
        size="large"
        variant="outlined"
        layout="vertical"
      >
        <Form.Item
          name="matchId"
          label="Match ID"
          rules={[{ required: true, message: "Please enter a match ID!" }]}
        >
          <Input placeholder="Search match ID..." />
        </Form.Item>

        <Form.Item>
          <Button
            className="back-button"
            onClick={() => router.back()}
          >
            Back
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default JoinPage;
