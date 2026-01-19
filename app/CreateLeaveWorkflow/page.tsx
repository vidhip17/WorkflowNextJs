"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import api from "@/src/services/api"; 

export default function CreateLeaveWorkflow() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const token = Cookies.get("token"); 
      const res = await api.post(
        "/api/auth/submit",
        { name },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.status === "SUCCESS") {
        alert("Leave workflow created successfully!");
        router.push("/home");
      } else {
        setError(res.data.message || "Something went wrong");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-96 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Create Workflow App</h2>

        {error && (
          <div className="mb-4 p-2 text-red-700 bg-red-100 rounded">{error}</div>
        )}

        <div className="mb-4">
          <label className="block font-semibold mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full p-3 rounded text-white ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}
