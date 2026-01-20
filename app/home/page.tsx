"use client";

import { useEffect, useState } from "react";
import api from "@/src/services/api";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface LeaveApp {
  id: number;
  leaveType: string;
  typeId: string;
  currentState: string;
  forwardCount: number;
  lastForwardedBy: string;
}

export default function HomePage() {
  const [leaveApps, setLeaveApps] = useState<LeaveApp[]>([]);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const router = useRouter();

  useEffect(() => {
    debugger;
  const token = Cookies.get("token");
  if (!token) {
    router.push("/login");
    return;
  }

    api.get("/api/auth/home1", {
    headers: {
        Authorization: `Bearer ${token}`
    }
    })
    .then(res => {
    setLeaveApps(res.data.leaveApps);
    setUsername(res.data.username);
    setUserId(res.data.userId);
    setIsAdmin(res.data.isAdmin);
    })
    .catch(err => {
        if (err.response?.status === 401) {
            Cookies.remove("token");
            router.push("/login");
        }else{
            router.push("/login");
        }
    });

}, []);


  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/login");
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">Welcome {username}</h2>
      <p>User ID: {userId}</p>
      <div className="my-4 space-x-2">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
        <button
          onClick={() => router.push("/CreateLeaveWorkflow")}
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
        >
          Create Application
        </button>
      </div>

      <h3 className="text-xl font-semibold my-4">Pending Workflows</h3>

      {leaveApps.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">ID</th>
                <th className="border px-2 py-1">Leave Type</th>
                <th className="border px-2 py-1">Workflow Type</th>
                <th className="border px-2 py-1">Current State</th>
                <th className="border px-2 py-1">Forward Count</th>
                <th className="border px-2 py-1">Last Forwarded By</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveApps.map((leave) => (
                <tr key={leave.id} className="text-center">
                  <td className="border px-2 py-1">{leave.id}</td>
                  <td className="border px-2 py-1">{leave.leaveType}</td>
                  <td className="border px-2 py-1">{leave.typeId}</td>
                  <td className="border px-2 py-1">{leave.currentState}</td>
                  <td className="border px-2 py-1">{leave.forwardCount}</td>
                  <td className="border px-2 py-1">{leave.lastForwardedBy}</td>
                  <td className="border px-2 py-1">
                    {isAdmin && leave.currentState !== "S_CLOSED" && (
                      <button
                        onClick={() =>
                          router.push(`/viewWorkflowUtility?id=${leave.id}`)
                        }
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                    )} | 
                    <button
                        onClick={() =>
                          router.push(`/WorkflowActionPage?instanceId=${leave.id}`)
                        }
                        className="text-blue-600 hover:underline"
                      > 
                        Action
                      </button>
                    
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No pending workflows.</p>
      )}
    </div>
  );
}
