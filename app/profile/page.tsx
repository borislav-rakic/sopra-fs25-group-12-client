"use client";

import React, { useEffect, useState } from "react";
import { Button, message } from "antd";
import "@ant-design/v5-patch-for-react-19";
import AvatarSelector from "./avatar";
import "./profile.css";
import { useApi } from "@/hooks/useApi";
import { useRouter } from "next/navigation";
import Image from "next/image"; // Add this to your imports
import { UserPrivateDTO } from "@/types/user";

const MyProfile: React.FC = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    password: "",
    passwordConfirmed: "",
    birthday: "",
    avatar: 101,
  });
  const formattedBirthday = form.birthday
    ? new Date(form.birthday).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "";
  const apiService = useApi();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/");
        return;
      }

      try {
        const user = await apiService.get<UserPrivateDTO>("/users/me");

        // If user is a guest, redirect to /landingpageuser
        if (user.isGuest) {
          router.push("/landingpageuser");
          return;
        }

        setForm((prev) => ({
          ...prev,
          username: user.username || "",
          birthday: user.birthday || "",
          avatar: user.avatar || 101,
        }));
      } catch (err: unknown) {
        console.error("Error fetching profile:", err);

        const error = err as { status?: number; message?: string };

        if (error.status === 401 || error.message?.includes("Invalid token")) {
          localStorage.removeItem("token");
          router.push("/");
        } else {
          alert("Failed to load profile.");
        }
      }
    };

    fetchProfile();
  }, [apiService, router]);

  const handleAvatarSelect = (avatarNumber: number) => {
    setForm((prev) => ({ ...prev, avatar: avatarNumber }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password && form.password !== form.passwordConfirmed) {
      message.open({
        type: "error",
        content: "Passwords do not match!",
        duration: 2,
      });
      return;
    }

    const payload: Record<string, string | number | boolean> = {};

    // Only include non-empty fields
    if (form.username.trim()) {
      payload.username = form.username.trim();
    }
    if (form.birthday.trim()) {
      payload.birthday = form.birthday.trim();
    }
    if (form.avatar) {
      payload.avatar = form.avatar;
    }
    if (form.password.trim()) {
      payload.password = form.password;
      payload.passwordConfirmed = form.passwordConfirmed;
    }

    // Only include non-empty fields
    if (form.username.trim()) {
      payload.username = form.username.trim();
    }
    if (form.birthday.trim()) {
      payload.birthday = form.birthday.trim();
    }
    if (form.avatar) {
      payload.avatar = form.avatar;
    }
    if (form.password.trim()) {
      payload.password = form.password;
      payload.passwordConfirmed = form.passwordConfirmed;
    }

    try {
      const updatedUser = await apiService.put(`/users/me`, payload);
      console.log("Update success, response:", updatedUser);
      message.open({
        type: "success",
        content: "Profile updated successfully.",
        duration: 2,
      });
      setForm((prev) => ({
        ...prev,
        password: "",
        passwordConfirmed: "",
      }));
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Failed to update profile.";

      message.open({
        type: "error",
        content: errorMessage,
        duration: 2,
      });
    }
  };

  const avatarUrl = `/avatars_118x118/a${form.avatar}.png`;

  return (
    <div className="profile-container">
      <div className="profile-header-fixed">
        <Image
          src={avatarUrl}
          alt="Selected Avatar"
          className="profile-avatar"
          width={65}
          height={65}
          priority
        />
        <div className="profile-info">
          <div className="profile-username">{form.username || "Username"}</div>
          <div className="profile-birthday">
            {formattedBirthday || "Birthday"}
          </div>
        </div>
      </div>
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            maxLength={36}
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter new password"
          />
        </label>
        <label>
          Confirm Password:
          <input
            type="password"
            name="passwordConfirmed"
            value={form.passwordConfirmed}
            onChange={handleChange}
            placeholder="Re-enter new password"
          />
        </label>
        <label>
          Birthday:
          <input
            type="date"
            name="birthday"
            value={form.birthday}
            onChange={handleChange}
          />
        </label>

        <AvatarSelector selected={form.avatar} onSelect={handleAvatarSelect} />

        <Button type="primary" color="green" htmlType="submit">
          Save Changes
        </Button>
        <Button
          type="primary"
          color="red"
          variant="solid"
          style={{ marginLeft: "1em" }}
          onClick={() => router.push("/landingpageuser")}
        >
          Cancel
        </Button>
      </form>
    </div>
  );
};

export default MyProfile;
