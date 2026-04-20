"use client";

import SimpleChat from "@/components/SimpleChat";

export default function App() {
  return (
    <main className="flex-col items-center justify-end bg-white">
      <div className="mx-auto w-full max-w-3xl p-4">
        <SimpleChat />
      </div>
    </main>
  );
}
