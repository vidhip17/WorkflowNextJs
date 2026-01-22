"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import api from "@/src/services/api";

export default function WorkflowActionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const instanceId = searchParams.get("instanceId");

  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");

  const [actions, setActions] = useState({
    forward: false,
    reject: false,
    rollBack: false,
  });

  useEffect(() => {
    if (!instanceId) return;

    const token = Cookies.get("token");
    if (!token) {
      router.push("/login");
      return;
    }

    api.get(`/api/auth/action?instanceId=${instanceId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        const data = res.data.response;
        setActions({
          forward: data.forward,
          reject: data.reject,
          rollBack: data.rollBack,
        });
        setLoading(false);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [instanceId, router]);

  const submitAction = (event: string) => {
    const token = Cookies.get("token");

    const payload = {
      instanceId: Number(instanceId),
      event,
      comment,
    };

    api.post("/api/auth/workflowAction", payload, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.data.status === "SUCCESS") {
          alert("Action performed successfully");
          router.push("/home");
        } else {
          alert(res.data.status);
        }
      })
      .catch(err => {
        alert(err.response?.data?.status || "Error occurred");
      });
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-xl space-y-6">

      <h2 className="text-2xl font-bold">Workflow Action</h2>

      {/* COMMENT */}
      <div>
        <label className="block font-semibold mb-1">Comment</label>
        <textarea
          className="border p-2 w-full rounded"
          rows={4}
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-4">
        {actions.forward && (
          <button
            onClick={() => submitAction("E_FORWARD")}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Forward
          </button>
        )}

        {actions.reject && (
          <button
            onClick={() => submitAction("E_REJECT")}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Reject
          </button>
        )}

        {actions.rollBack && (
          <button
            onClick={() => submitAction("E_ROLLBACK")}
            className="bg-yellow-600 text-white px-4 py-2 rounded"
          >
            Rollback
          </button>
        )}

        <button
          onClick={() => router.back()}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Back
        </button>
      </div>
    </div>
  );
}
