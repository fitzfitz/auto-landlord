import { getOrCreateUser } from "@/lib/auth";
import { updateProfile } from "./actions";

export default async function SettingsPage() {
  const user = await getOrCreateUser();

  if (!user) {
    return <div>Please sign in.</div>;
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="bg-white border rounded-lg p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Profile Information</h2>

        <form action={updateProfile} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              name="name"
              type="text"
              defaultValue={user.name || ""}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-2 border rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-sm text-gray-500 mt-1">
              Email cannot be changed.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <input
              type="text"
              value={user.role}
              disabled
              className="w-full px-4 py-2 border rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 font-medium"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
