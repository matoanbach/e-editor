import { auth } from "@/firebase/firebase";
import Link from "next/link";
import React, { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import Logout from "../Logout/Logout";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { BsList } from "react-icons/bs";
import Timer from "../Timer/Timer";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import { handleAuthCallback, loginUser, logoutUser } from "@/state/user/userSlice";

type TopbarProps = {
};

const Topbar: React.FC<TopbarProps> = () => {
  // Use auth0 to handle authentication
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, email, picture } = useSelector((state: RootState) => state.userSlice)

  const handleLogin = () => {
    dispatch(loginUser())
  }


  useEffect(() => {
    if (window.location.search.includes("code=")) {
      dispatch(handleAuthCallback())
    }
  }, [dispatch])


  return (
    <nav className="relative flex h-[50px] w-full shrink-0 items-center px-5 bg-dark-layer-1 text-dark-gray-7">
      <div
        className={`flex w-full items-center justify-between`}
      >
        <Link href="/" className="h-[22px] flex-1">
          <img src="/logo-full.png" alt="Logo" className="h-full" />
        </Link>

        <div className="flex items-center gap-4 flex-1 justify-center">
          <div
            className="flex items-center justify-center rounded bg-dark-fill-3 hover:bg-dark-fill-2 h-8 w-8 cursor-pointer"
          >
            <FaChevronLeft />
          </div>
          <div
            className="flex items-center justify-center rounded bg-dark-fill-3 hover:bg-dark-fill-2 h-8 w-8 cursor-pointer"
          >
            <FaChevronRight />
          </div>
        </div>

        <div className="flex items-center space-x-4 flex-1 justify-end">
          {!isAuthenticated && (
            // <Link href="/auth">
            <button className="bg-dark-fill-3 py-1 px-2 cursor-pointer rounded" onClick={handleLogin}>
              Sign In
            </button>
            // </Link>
          )}
          <Timer />
          {isAuthenticated && (
            <div className="cursor-pointer group relative">
              <img
                src={picture!}
                alt="user profile img"
                className="h-8 w-8 rounded-full"
              />

              <div className="absolute top-10 left-2/4 -translate-x-2/4 mx-auto bg-dark-layer-1 text-brand-orange p-2 rounded shadow-lg z-40 group-hover:scale-100 scale-0 transition-all duration-300 ease-in-out">
                <p className="text-sm">{email}</p>
              </div>
            </div>
          )}
          {isAuthenticated && <Logout />}
        </div>
      </div>
    </nav >
  );
};
export default Topbar;
