import ProblemTable from "@/components/ProblemTable/ProblemTable";
import Topbar from "@/components/Topbar/Topbar";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [inputs, setInputs] = useState({
    id: "",
    title: "",
    difficulty: "",
    category: "",
    videoId: "",
    link: "",
    order: 0,
    likes: 0,
    dislikes: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  console.log(inputs);

  // return (
  //   <>
  //     <main className="bg-dark-layer-2 min-h-screen">
  //       <Topbar />
  //       <Link href="/problem">
  //         Practice
  //       </Link>
  //     </main>
  //   </>
  // );
  return (
    <>
      <main className="bg-dark-layer-2 min-h-screen">
        <Topbar enabled={false}/>
        <div className="flex flex-col items-center justify-center p-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Welcome to the Coding Practice Platform
          </h1>
          <p className="text-gray-300 text-center max-w-xl mb-8">
            Practice coding problems, solve challenging LeetCode-style questions, and learn with the help of our integrated AI assistant.
          </p>

          <Link href="/problem">
            <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition duration-200 mb-10">
              Get started
            </button>
          </Link>

          {/* Optional: YouTube Demo Video */}
          <div className="w-full max-w-2xl aspect-w-16 aspect-h-9 mb-8">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/VIDEO_ID_HERE"
              title="Demo Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          {/* If you want to show a problem table or something else: */}
          {/* <ProblemTable /> */}
        </div>
      </main>
    </>
  );
}
