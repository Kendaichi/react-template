import useUserStore from "@/stores/useUserStore";

export default function Home() {
  const { user } = useUserStore();

  return (
    <div className="px-4 py-8 lg:px-8 lg:py-12">
      <h1 className="text-2xl font-bold text-gray-800">
        Welcome back, <span className="text-blue-500">{user?.name}</span>!
      </h1>
      <p className="text-gray-500 mt-2">
        This is your home page. Start building your application here.
      </p>
    </div>
  );
}
