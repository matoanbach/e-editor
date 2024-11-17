import React from "react";
import { FaRegQuestionCircle } from "react-icons/fa";
import { VscNewline } from "react-icons/vsc";

type APIRequestFormProps = {
  handleChange:  (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const APIRequestForm: React.FC<APIRequestFormProps> = ({handleChange}) => {
  return (
    <div className="flex items-center gap-3">
      <FaRegQuestionCircle/>
      <form className="flex items-center gap-3 text-nowrap">
        <label
          className="text-sm font-medium block text-gray-300"
          htmlFor="apikey"
        >
          OPENAI API KEY
        </label>
        <input
          onChange={handleChange}
          className="outline-none rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-dark-fill-3 border-gray-500 placeholder-gray-400 pl-3"
          type="text"
          name="apikey"
          id="apikey"
          placeholder="your_api_key"
        />
      </form>
    </div>
  );
};
export default APIRequestForm;
