import InputBox from "../components/input.component";
import { User, Mail, KeyRound } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import GoogleIcon from "../imgs/google.png";
import AnimationWrapper from "../common/page-animation";
import { useContext } from "react";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/session";
import { UserContext } from "../App";
import { authWithGoogle } from "../common/firebase";

const UserAuthForm = ({ type }) => {
  let {
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  const userAuthThroughServer = (serverRoute, formData) => {
    axios
      .post(`${import.meta.env.VITE_SERVER_URL + serverRoute}`, formData)
      .then(({ data }) => {
        toast.success("Request successful!");
        storeInSession("user", JSON.stringify(data));
        setUserAuth(data);
      })
      .catch((error) => {
        if (error.response) {
          toast.error(error.response.data.error || "Server error occurred.");
        } else {
          toast.error("Network error. Please try again.");
        }
        console.error(error);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const serverRoute = type === "sign-in" ? "/signin" : "/signup";

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    const form = e.target;
    const formData = new FormData(form);
    const formObj = Object.fromEntries(formData);
    const { fullname, email, password } = formObj;

    if (type !== "sign-in" && (!fullname || fullname.length < 3)) {
      return toast.error("Fullname must be at least 3 characters.");
    }

    if (!email || !emailRegex.test(email)) {
      return toast.error("Invalid email address.");
    }

    if (!password || !passwordRegex.test(password)) {
      return toast.error(
        "Password must be 6-20 characters with at least one uppercase letter, one lowercase letter, and one number."
      );
    }

    userAuthThroughServer(serverRoute, formObj);
  };

  const handleGoogleAuth = async (e) => {
    e.preventDefault();
    try {
      const authData = await authWithGoogle();
      if (!authData || !authData.access_token) {
        throw new Error('Failed to get authentication token');
      }

      const serverRoute = "/google-auth";
      const formData = { 
        access_token: authData.access_token,
      };

      userAuthThroughServer(serverRoute, formData);
    } catch (err) {
      console.error("Google Auth Error:", err);
      toast.error("Trouble logging in through Google");
    }
  };

  return access_token ? (
    <Navigate to="/" />
  ) : (
    <AnimationWrapper keyvalue={type}>
      <section className="h-cover flex items-center justify-center">
        <Toaster />
        <form onSubmit={handleSubmit} className="w-[80%] max-w-[400px]">
          <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
            {type === "sign-in" ? "Welcome Back" : "Join us today"}
          </h1>
          {type !== "sign-in" && (
            <InputBox
              name="fullname"
              type="text"
              placeholder="Full Name"
              icon={<User size={20} className="absolute left-2 top-4" />}
            />
          )}
          <InputBox
            name="email"
            type="email"
            placeholder="Email"
            icon={<Mail size={20} className="absolute left-2 top-4" />}
          />
          <InputBox
            name="password"
            type="password"
            placeholder="Password"
            icon={<KeyRound size={20} className="absolute left-2 top-4" />}
          />
          <button
            className="btn-dark center mt-14"
            type="submit"
          >
            {type.replace("-", " ")}
          </button>
          <div className="relative flex items-center gap-2 my-10 text-dark-grey text-sm uppercase font-bold">
            <hr className="border-black w-1/2" />
            <p>or</p>
            <hr className="border-black w-1/2" />
          </div>
          <button
            className="btn-dark flex items-center justify-center gap-4 center"
            onClick={handleGoogleAuth}
            type="button"
          >
            <img src={GoogleIcon} alt="Google Icon" className="w-5" />
            Continue with Google
          </button>
          {type === "sign-in" ? (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Don't have an account?
              <Link to="/signup" className="underline text-black text-xl ml-1">
                Sign Up
              </Link>
            </p>
          ) : (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Already have an account?
              <Link to="/signin" className="underline text-black text-xl ml-1">
                Sign in here.
              </Link>
            </p>
          )}
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default UserAuthForm;