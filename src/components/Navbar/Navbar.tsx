import { authModalState } from "@/atoms/authModalAtom";
import { AppDispatch, RootState } from "@/state/store";
import Link from "next/link";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSetRecoilState } from "recoil";

type NavbarProps = {};

const Navbar: React.FC<NavbarProps> = () => {
  const setAuthModalState = useSetRecoilState(authModalState);
  const handleClick = () => {
    setAuthModalState((prev) => ({ ...prev, isOpen: true }))
  }

  return (
    <div className="flex items-center justify-between sm:px-12 px-2 md:px-24">
      <Link href="/" className="flex items-center justify-center h-20">
        <img src="/logo.png" alt="LeetClone" className="h-full" />
      </Link>
      <div className="flex items-center ">
        <button className="bg-brand-orange text-white px-2 py-1 md:px-4 rounded-md text-sm font-medium hover:bg-white hover:text-brand-orange transition duration-300 ease-in-out" onClick={handleClick}>
          Sign In
        </button>
      </div>
    </div>
  );
};
export default Navbar;
