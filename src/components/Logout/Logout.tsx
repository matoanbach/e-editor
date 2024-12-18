import { AppDispatch } from "@/state/store";
import { logoutUser } from "@/state/user/userSlice";
import React from "react";
import { FiLogOut } from "react-icons/fi";
import { useDispatch } from "react-redux";


const Logout: React.FC = () => {
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
