export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#C89D7C] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#8B7D6B]">Loading...</p>
      </div>
    </div>
  );
}
