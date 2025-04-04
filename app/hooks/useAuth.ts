import { useEffect, useState } from "react";
import { useApi } from "./useApi";

export interface AuthUser {
  id: number;
  username: string;
  status: string;
  avatar: number;
  birthday: string;
  rating: number;
  userSettings: string;
}

export const useAuth = () => {
  const api = useApi();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get<AuthUser>("/users/me");
        setUser(res);
      } catch (err) {
        console.log("Fetchin User produced an error: ", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [api]);

  return {
    user,
    isLoggedIn: !!user,
    loading,
  };
};
