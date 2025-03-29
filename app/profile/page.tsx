"use client"

import React, { useState } from 'react';
import AvatarSelector from './avatar';
import './profile.css';
import { useApi } from "@/hooks/useApi";

interface ProfileProps {
  profileId: string;
}

const Profile: React.FC<ProfileProps> = ({ profileId }) => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    passwordConfirmed: '',
    birthday: '',
    avatar: 1,
  });
  
  const apiService = useApi();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarSelect = (avatarNumber: number) => {
    setForm((prev) => ({ ...prev, avatar: avatarNumber }));
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (form.password && form.password !== form.passwordConfirmed) {
      alert('Passwords do not match!');
      return;
    }
  
    const payload: Record<string, any> = {};

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
      console.log("PUT payload:", payload);
      const updatedUser = await apiService.put(`/users/me`, payload);
      alert('Profile updated successfully!');
      setForm((prev) => ({
        ...prev,
        password: '',
        passwordConfirmed: '',
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
  };
  
  

  return (
    <div className="profile-container">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input name="username" value={form.username} onChange={handleChange} />
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
          <input type="date" name="birthday" value={form.birthday} onChange={handleChange} />
        </label>

        <AvatarSelector selected={form.avatar} onSelect={handleAvatarSelect} />

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default Profile;
