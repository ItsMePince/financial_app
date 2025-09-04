import React, { useState, ChangeEvent, FormEvent } from "react";
import { UserRound } from "lucide-react";
import "./SignUp.css";

type SignUpValues = {
  email: string;
  username: string;
  password: string;
};

interface SignUpProps {
  onSubmit?: (values: SignUpValues) => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSubmit }) => {
  const [form, setForm] = useState<SignUpValues>({
    email: "",
    username: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit ? onSubmit(form) : console.log("signup", form);
  };

  return (
    <div className="su-page">
      <div className="su-wrapper">
        <div className="su-avatar" aria-hidden="true">
          <UserRound size={36} />
        </div>

        <h1 className="su-title">Sign up</h1>

        <form className="su-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="email" className="su-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="su-input"
            placeholder="you@example.com"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
          />

          <label htmlFor="username" className="su-label">
            Username
          </label>
          <input
            id="username"
            name="username"
            className="su-input"
            autoComplete="username"
            required
            value={form.username}
            onChange={handleChange}
          />

          <label htmlFor="password" className="su-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="su-input"
            autoComplete="new-password"
            required
            value={form.password}
            onChange={handleChange}
          />

          <button type="submit" className="su-submit">
            Create account
          </button>
        </form>

        <p className="su-footer">
          Already have an account?{" "}
          <a className="su-link" href="#">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
