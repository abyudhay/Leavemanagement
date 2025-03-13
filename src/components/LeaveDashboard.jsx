import { useState } from "react";

const LeaveDashboard = () => {
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const token = localStorage.getItem("token"); // Retrieve token

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("User not authenticated. Please log in again.");
      return;
    }

    try {
      const response = await fetch("http://localhost:9000/api/leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Include token in the request
        },
        body: JSON.stringify({ reason, startDate, endDate }),
      });

      if (response.ok) {
        alert("Leave request submitted successfully!");
      } else {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          alert(`Failed to submit leave: ${errorData.error}`);
        } else {
          alert("Failed to submit leave: Unknown error occurred.");
        }
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" required />
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
      <button type="submit">Submit Leave</button>
    </form>
  );
};

export default LeaveDashboard;
