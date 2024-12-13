import { auth } from "@/firebase/firebase";
import { AppDispatch } from "@/state/store";
import { logoutUser } from "@/state/user/userSlice";
import React from "react";
import { useSignOut } from "react-firebase-hooks/auth";
import { FiLogOut } from "react-icons/fi";
import { useDispatch } from "react-redux";

type LogoutProps = {};

const Logout: React.FC<LogoutProps> = () => {
  const [signOut, loading, error] = useSignOut(auth);
  const dispatch = useDispatch<AppDispatch>()

  const handleLogout = () => {
    dispatch(logoutUser())
  }

  return (
    <button
      className="bg-dark-fill-3 py-1.5 px-3 cursor-pointer rounded text-brand-orange"
      onClick={handleLogout}
    >
      <FiLogOut />
    </button>
  );
};
export default Logout;
