import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err.response.data);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        <h2 className="text-2xl mb-4">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Login
        </button>
        <p className="mt-2">
          No account?{" "}
          <a href="/register" className="text-blue-500">
            Register
          </a>
        </p>
      </form>
    </div>
  );
}

export default Login;
