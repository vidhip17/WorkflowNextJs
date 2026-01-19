"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import api from "@/src/services/api";

export default function ViewWorkflowPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
//   const [id, setId] = useState<string | null>(null);
  const router = useRouter();

  const [wf, setWf] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);

  const [event, setEvent] = useState("");
  const [actionBy, setActionBy] = useState<number | null>(null);
  const [reviewerCount, setReviewerCount] = useState<number>(0);
  const [reviewers, setReviewers] = useState<Record<number, number[]>>({});
  const [approvedUsers, setApprovedUsers] = useState<number[]>([]);
  const [adminIds, setAdminIds] = useState<number[]>([]);
  const [considerAll, setConsiderAll] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token || !id) {
      router.push("/login");
      return;
    }

    api.get(`/api/auth/viewWorkflow/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        setWf(res.data.wfInstEntity);
        setUsers(res.data.userMasters);
        setAdmins(res.data.adminUserMasters);
      })
      .catch(() => {
        Cookies.remove("token");
        router.push("/login");
      });
  }, [id]);

  const handleReviewerChange = (level: number, userIds: number[]) => {
    setReviewers(prev => ({ ...prev, [level]: userIds }));
  };

  const submit = () => {
    const reviewerMap = Object.entries(reviewers)
      .map(([k, v]) => ({ first: Number(k), second: v }))
      .filter(r => r.second.length > 0);

    const payload = {
      workflowInstanceId: wf.id,
      workflowType: wf.typeId,
      reviewers: reviewerMap,
      approvedUserIds: approvedUsers,
      adminIds,
      considerAllLevelApprove: considerAll,
      event,
      actionBy,
      comment
    };

    api.post("/api/auth/resetReviewers", payload, {
      headers: { Authorization: `Bearer ${Cookies.get("token")}` },
    })
      .then(res => {
        if (res.data.status === "SUCCESS") {
          alert("Changes saved successfully!");
          router.push("/home");
        } else {
          alert(res.data.status);
        }
      })
      .catch(err => alert(err.response?.data?.status || "Error"));
  };

  if (!wf) return <p>Loading...</p>;

  return (
    <div className="p-6 space-y-6">

      {/* DETAILS */}
      <h2 className="text-2xl font-bold mb-4">Workflow Details</h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">
            State
            </label>
            <input
            readOnly
            value={wf.currentState}
            className="border rounded p-2 bg-gray-100"
            />
        </div>

        <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">
            Forward Count
            </label>
            <input
            readOnly
            value={wf.forwardCount}
            className="border rounded p-2 bg-gray-100"
            />
        </div>

        <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">
            Created Date
            </label>
            <input
            readOnly
            value={wf.createdDate}
            className="border rounded p-2 bg-gray-100"
            />
        </div>
    </div>


      {/* CURRENT REVIEWERS */}
        <h3 className="text-2xl font-bold mb-4">Current Reviewers & Levels</h3>

        <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
            <tr>
                <th className="border border-gray-300 px-4 py-2 text-center">Level</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Users</th>
            </tr>
            </thead>
            <tbody>
            {wf.reviewers?.map((r: any, i: number) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="border border-gray-300 px-4 py-2 text-center font-medium">
                    {r.first}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                    {r.second
                    .map((id: number) => users.find(u => u.id === id)?.username)
                    .filter(Boolean)
                    .join(", ")}
                </td>
                </tr>
            ))}
            {!wf.reviewers || wf.reviewers.length === 0 && (
                <tr>
                <td colSpan={2} className="text-center py-4 text-gray-500">
                    No reviewers assigned
                </td>
                </tr>
            )}
            </tbody>
        </table>
        </div>


      {/* EVENT */}
    <label htmlFor="event" className="text-sm font-semibold text-gray-700">Event</label>      
    <select className="border p-2 w-full" onChange={e=>setEvent(e.target.value)}>
        <option value="">-- Select Event --</option>
        <option value="E_SUBMIT">E_SUBMIT</option>
        <option value="E_CANCEL">E_CANCEL</option>
        <option value="E_REJECT">E_REJECT</option>
        <option value="E_REQUEST_CHANGES_IN">E_REQUEST_CHANGES_IN</option>
        <option value="E_FORWARD">E_FORWARD</option>
      </select>

      {/* ACTION BY */}
      <label htmlFor="actionBy" className="text-sm font-semibold text-gray-700">Action By</label>
      <select className="border p-2 w-full" onChange={e=>setActionBy(Number(e.target.value))}>
        <option value="">-- Select User --</option>
        {users.map(u=>(
          <option key={u.id} value={u.id}>{u.username}</option>
        ))}
      </select>

      {/* REVIEWER COUNT */}
      <label htmlFor="reviewerCount" className="text-sm font-semibold text-gray-700">Reviewer Count</label>
      <select className="border p-2 w-full" onChange={e=>setReviewerCount(Number(e.target.value))}>
        <option value="">-- Reviewers Count --</option>
        {[...Array(8)].map((_,i)=><option key={i} value={i+1}>{i+1}</option>)}
      </select>

      {/* LEVEL DROPDOWNS */}
      {[...Array(reviewerCount)].map((_,i)=>(
        <select
          key={i}
          multiple
          className="border p-2 w-full"
          onChange={e =>
            handleReviewerChange(
              i+1,
              Array.from(e.target.selectedOptions).map(o=>Number(o.value))
            )
          }>
          {users.map(u=>(
            <option key={u.id} value={u.id}>{u.username}</option>
          ))}
        </select>
      ))}

      {/* APPROVED */}
      <label htmlFor="approvedUser" className="text-sm font-semibold text-gray-700">Approved User</label>
      <select multiple className="border p-2 w-full" onChange={e=>{
        setApprovedUsers(Array.from(e.target.selectedOptions).map(o=>Number(o.value)));
      }}>
        {users.map(u=>(
          <option key={u.id} value={u.id}>{u.username}</option>
        ))}
      </select>

      {/* ADMINS */}
      <label htmlFor="admins" className="text-sm font-semibold text-gray-700">Admins</label>
      <select multiple className="border p-2 w-full" onChange={e=>{
        setAdminIds(Array.from(e.target.selectedOptions).map(o=>Number(o.value)));
      }}>
        {admins.map(u=>(
          <option key={u.id} value={u.id}>{u.username}</option>
        ))}
      </select>

      <label>
        <input type="checkbox" onChange={e=>setConsiderAll(e.target.checked)} /> Consider All Level Approve
      </label>

      <textarea
        className="border p-2 w-full"
        placeholder="Comment"
        onChange={e=>setComment(e.target.value)}
      />

      <div className="flex gap-4">
        <button onClick={()=>router.push("/home")} className="bg-gray-600 text-white px-4 py-2">Back</button>
        <button onClick={submit} className="bg-green-600 text-white px-4 py-2">Submit</button>
      </div>
    </div>
  );
}
