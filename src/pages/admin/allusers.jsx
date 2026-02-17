import React, { useEffect, useState } from "react";

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:3000";

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    fetch(`${API_BASE}/api/admin/getUsers`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUsers(data.users);
      });
  };

  const toggleStatus = async (user) => {
  const newStatus = user.status === 1 ? 0 : 1;

  try {
    const res = await fetch(`${API_BASE}/api/admin/toggleStatus`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.user_id,
        status: newStatus,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.user_id === user.user_id
            ? { ...u, status: newStatus }
            : u
        )
      );
    }
  } catch (error) {
    console.error("Status update failed:", error);
  }
};


  

const togglePremium = async (user) => {
  const isCurrentlyPremium =
    user.ispremium === true || user.ispremium === 1;

  const newPremium = isCurrentlyPremium ? false : true;

  try {
    const res = await fetch(`${API_BASE}/api/admin/togglePremium`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.user_id,
        ispremium: newPremium,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.user_id === user.user_id
            ? { ...u, ispremium: newPremium }
            : u
        )
      );
    }
  } catch (error) {
    console.error("Premium update failed:", error);
  }
};


  

  const filteredUsers = users.filter((user) => {
  const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();

  const matchesSearch =
    fullName.includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase());

  const matchesRole =
    roleFilter === "all" ||
    user.role?.toLowerCase() === roleFilter.toLowerCase();

  return matchesSearch && matchesRole;
});



  return (
    <div className="admin-container">
      <h2>All Users</h2>

      {/* Controls */}
      <div className="controls">
        <input
          type="text"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="client">Client</option>
        </select>
      </div>

      {/* Stats Section */}
<div className="stats-container">
  <div className="stat-card">
    <h3>Total Users</h3>
    <p>{users.length}</p>
  </div>

  <div className="stat-card">
    <h3>Filtered Users</h3>
    <p>{filteredUsers.length}</p>
  </div>
</div>


      {/* Table */}
      <table className="user-table">
        <thead>
  <tr>
    <th>ID</th>
    <th>Name</th>
    <th>Email</th>
    <th>WhatsApp</th>
    <th>Country</th>
    <th>Role</th>
    <th>Premium</th>
    <th>Status</th>
    <th>Status Action</th>
     <th>Premium Action</th>
    
  </tr>
</thead>

<tbody>
  {filteredUsers.map((user) => (
    <tr key={user.user_id}>
      <td>{user.user_id}</td>
      <td>{user.first_name} {user.last_name}</td>
      <td>{user.email}</td>
      <td>{user.whatsapp_number}</td>
      <td>{user.country}</td>
      <td>{user.role}</td>

      {/* Premium Status Column */}
      <td>
        {user.ispremium === true || user.ispremium === 1
          ? "Yes"
          : "No"}
      </td>

      

      {/* Status Column */}
      <td>{user.status === 1 ? "Active" : "Inactive"}</td>

      {/* Status Action Column */}
<td>
  <button
    onClick={() => toggleStatus(user)}
    className={user.status === 1 ? "btn-red" : "btn-green"}
  >
    {user.status ? "Inactive" : "Active"}
  </button>
</td>



      {/* Premium Action Column */}
     <td>
  <button
    onClick={() => togglePremium(user)}
     className={
      user.ispremium === true || user.ispremium === 1
        ? "btn-red"
        : "btn-green"
    }
  >
    {user.ispremium === true || user.ispremium === 1
      ? "Remove Premium"
      : "Make Premium"}
  </button>
</td>

    </tr>
  ))}
</tbody>


      </table>
    </div>
  );
}
