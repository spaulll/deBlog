import { EyeClosed, Eye } from "lucide-react";
import { useState } from "react";
const InputBox = ({ name, type, id, value, placeholder, icon, disable = false }) => {
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  return (
    <>
      <div className="relative w-[100%] mb-4">
        <input
          name={name}
          type={
            type === "password" && !passwordVisibility ? "password" : "text"
          }
          placeholder={placeholder}
          value={value}
          defaultValue={value}
          id={id}
          className="input-box"
          disable = {disable}
        />
        {icon}
        {type == "password" ? (
          passwordVisibility == false ? (
            <EyeClosed
              size="22px"
              className="absolute top-4 right-2 hover:cursor-pointer"
              onClick={() => setPasswordVisibility((currentval) => !currentval)}
            />
          ) : (
            <Eye
              size="22px"
              className="absolute top-4 right-2 hover:cursor-pointer"
              onClick={() => setPasswordVisibility((currentval) => !currentval)}
            />
          )
        ) : (
          ""
        )}
      </div>
    </>
  );
};
export default InputBox;
