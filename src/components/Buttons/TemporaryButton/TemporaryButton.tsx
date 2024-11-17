import React from "react";

type TemporaryButtonProps = {
  label?: string;
  iconPosition?: "start" | "end";
  iconColor?: "red" | "green" | "grey";
  iconFill?: boolean;
  buttonStyle?: "regular" | "action" | "alert" | "flush";
  disabledBttn?: boolean;
};

const TemporaryButton: React.FC<TemporaryButtonProps> = ({
  label,
  disabledBttn=false,
}) => {
  return (
    <button
      className={`relative inline-flex cursor-pointer items-center ${
        disabledBttn ? "opacity-10 cursor-not-allowed" : ""
      }`}
    >
      <input type="checkbox" value="" className="peer sr-only" />
      {/* <div className="relative flex h-9 items-center rounded-full bg-dark-fill-3 text-white"> */}
      <div className={`relative flex items-center rounded-full ${label === "Disconnect" ? "bg-blue-500" : "bg-dark-fill-3"} ${label === "Release to send" ? "bg-red-600" : ""} text-white`}>
        <div className="relative z-10 flex w-full justify-between text-sm">
          <div className="transition-colors rounded-full p-2 text-nowrap">
            <p className="select-none">{label}</p>
          </div>
        </div>
      </div>
    </button>
  );
};
export default TemporaryButton;
