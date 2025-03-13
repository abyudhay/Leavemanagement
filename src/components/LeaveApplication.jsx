import { useState } from "react";

const LeaveApplication = () => {
  const [leaveType, setLeaveType] = useState("Casual");
  const [days, setDays] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const leaveData = { leaveType, days: Number(days), reason };

    try {
      const response = await fetch("http://localhost:9000/api/leaves/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leaveData),
      });

      if (response.ok) {
        alert("Leave request submitted successfully!");
        setDays("");
        setReason("");
      } else {
        alert("Error submitting leave request.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="leave-form">
      <h2>Apply for Leave</h2>
      <form onSubmit={handleSubmit}>
        <label>Leave Type:</label>
        <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
          <option value="Casual">Casual</option>
          <option value="Medical">Medical</option>
        </select>

        <label>Number of Days:</label>
        <input type="number" value={days} onChange={(e) => setDays(e.target.value)} required />

        <label>Reason:</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} required />

        <button type="submit">Apply</button>
      </form>
    </div>
  );
};

export default LeaveApplication;
