import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user } = useAuth();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="bg-white p-4 rounded shadow">
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>User ID:</strong> {user?.id}</p>
        <p className="text-gray-500 mt-2">More settings coming soon...</p>
      </div>
    </div>
  );
}
