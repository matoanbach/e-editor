import React, { useEffect, useRef, useState } from "react";

type TemporaryToggleProps = {
  defaultValue: boolean;
  labels: string[];
  values?: string[];
  onChange?: (isEnabled: boolean, value: string) => void;
};

const TemporaryToggle: React.FC<TemporaryToggleProps> = ({
  defaultValue,
  labels,
  values,
  onChange = () => {},
}) => {
  const [value, setValue] = useState<boolean>(defaultValue);

  const toggleValue = () => {
    const v = !value;
    const index = +v;
    console.log(index)
    setValue(v);
    onChange(v, (values || [])[index]);
  };

  return (
    <label className="relative inline-flex cursor-pointer items-center" onClick={toggleValue}>
      <div className="relative flex items-center rounded-full bg-dark-fill-2 text-white">
        <div className="relative z-10 flex w-full justify-between text-sm">
          <div
            className={`transition-colors rounded-full p-2  ${
              !value ? "text-white bg-dark-fill-3" : "text-gray-500"
            }`}
          >
            <p className="select-none">{labels[0]}</p>
          </div>
          <div
            className={`transition-colors rounded-full p-2 ${
              value ? "text-white  bg-dark-fill-3" : "text-gray-500"
            }`}
          >
            <p className="select-none">{labels[1]}</p>
          </div>
        </div>
      </div>
    </label>
  );
};
export default TemporaryToggle;
