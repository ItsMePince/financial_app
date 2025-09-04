import React, { useState } from "react";
import "./Login.css";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: call your API here
    alert(`username: ${username}\npassword: ${"*".repeat(password.length)}`);
  };

  return (
    <div className="login-page">
      <div className="card">
        <div className="avatar" aria-hidden="true">
          {/* simple user icon */}
          <svg viewBox="0 0 24 24" width="42" height="42" role="img" aria-label="user">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20a8 8 0 0116 0" />
          </svg>
        </div>

        <h1 className="title">login</h1>

        <form className="form" onSubmit={onSubmit}>
          <label className="label">
            Username
            <input
              type="text"
              className="input"
              placeholder=""
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>

          <label className="label">
            Password
            <input
              type="password"
              className="input"
              placeholder=""
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="btn">login</button>
        </form>

        <p className="footnote">
          Don’t have an account?
          <a className="link" href="#signup" onClick={(e) => e.preventDefault()}>
            {" "}Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
