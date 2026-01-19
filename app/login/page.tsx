"use client";

import { useState } from "react";
import api from "@/src/services/api";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const router = useRouter();

  const handleLogin = async () => {
    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    if (!password.trim()) {
      setError("Password is required");
      return;
    }
    api.post("/api/auth/login", { username, password })
        .then(res => {
            if (res.data.success) {
                Cookies.set("token", res.data.token); 
                router.push("/home");
            } else {
                setError(res.data.message);
            }
        }).catch((err) => {
            if (err.response) {
                const msg =
                    err.response.data?.message || "Unauthorized. Invalid credentials";
                setError(msg);
            } else {
                setError("Server not reachable. Please try again later.");
            }
        });
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-96 p-6 border rounded">
        <h2 className="text-xl mb-4">Login</h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded">
            {error}
          </div>
        )}

        <input
          className="border p-2 w-full mb-3"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          className="border p-2 w-full mb-3"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white w-full p-2"
        >
          Login
        </button>
      </div>
    </div>
  );
}
