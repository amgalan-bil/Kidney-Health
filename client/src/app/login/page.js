"use client";
import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";
import { post } from "../api";

const Login = () => {
  const router = useRouter();
  const { setIsLoggedin, getUserData, isLoggedin, userData } =
    useContext(AppContent);
  const [state, setState] = useState("Sign Up"); // Keep state in English for logic
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      if (state === "Sign Up") {
        const data = await post("/api/v1/auth/register", {
          name,
          email,
          password,
        });

        if (data.success) {
          setIsLoggedin(true);
          getUserData();
          router.push("/");
        } else {
          toast.error(data.message);
        }
      } else {
        const data = await post(
          "/api/v1/auth/login",
          {
            email,
            password,
          },
          { withCredentials: true }
        );

        if (data.success) {
          setIsLoggedin(true);
          getUserData();
          router.push("/");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  useEffect(() => {
    if (isLoggedin && userData) {
      router.push("/");
    }
  }, [isLoggedin, userData, router]);

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to bg-purple-400">
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          {state === "Sign Up" ? "Бүртгэл үүсгэх" : "Нэвтрэх"}
        </h2>
      {/* asdf */}

        <form onSubmit={onSubmitHandler}>
          {state === "Sign Up" && (
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={null} alt="" />
              <input
                onChange={(e) => setName(e.target.value)}
                type="text"
                value={name}
                placeholder="Овог нэр"
                required
                className="bg-transparent outline-none placeholder-grey text-white w-full"
              />
            </div>
          )}

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={null} alt="" />
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="И-мэйл"
              required
              className="bg-transparent outline-none placeholder-grey text-white w-full"
            />
          </div>

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={null} alt="" />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Нууц үг"
              required
              className="bg-transparent outline-none placeholder-grey text-white w-full"
            />
          </div>

          <p
            onClick={() => router.push("/reset-password")}
            className="mb-4 text-indigo-500 cursor-pointer"
          >
            Нууц үг мартсан уу?
          </p>
          <button className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900  rounded-full mt-3 text-white font-medium cursor-pointer">
            {state === "Sign Up" ? "Бүртгүүлэх" : "Нэвтрэх"}
          </button>
        </form>

        {state == "Sign Up" ? (
          <p className="text-gray-400 text-center text-xs mt-4">
            Бүртгэлтэй юу?{" "}
            <span
              onClick={() => setState("Login")}
              className="text-blue-400 cursor-pointer underline"
            >
              Энд дарж нэвтэрнэ үү
            </span>
          </p>
        ) : (
          <p className="text-gray-400 text-center text-xs mt-4">
            Бүртгэл байхгүй юу?{" "}
            <span
              onClick={() => setState("Sign Up")}
              className="text-blue-400 cursor-pointer underline"
            >
              Бүртгүүлэх
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
