import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";

function LoginPage() {

  const navigate = useNavigate();

  const [customerId, setCustomerId] =
    useState("");

  const [password, setPassword] =
    useState("");

  const login = async () => {

    try {

      const response =
        await fetch(
          "http://localhost:8084/auth/login",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              customerId,
              password
            })
          }
        );

      if (response.ok) {

        const customer =
          await response.json();

        localStorage.setItem(
          "customer",
          JSON.stringify(customer)
        );

        navigate("/dashboard");

      } else {

        alert(
          "Invalid Customer ID or Password"
        );
      }

    } catch {

      alert(
        "Backend not running"
      );
    }
  };

  return (

    <div className="login-page">

      <div className="left-panel">

        <h1>
          Axis Bank
        </h1>

        <h2>
          Internet Banking
        </h2>

        <p>
          Secure Banking Anytime,
          Anywhere
        </p>

      </div>

      <div className="right-panel">

        <div className="login-box">

          <h2>
            Login
          </h2>

          <label>
            Customer ID
          </label>

          <input
            type="text"
            placeholder="Enter Customer ID"
            value={customerId}
            onChange={(e) =>
              setCustomerId(
                e.target.value
              )
            }
          />

          <label>
            Password
          </label>

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
          />

          <button
            className="login-btn"
            onClick={login}
          >
            Login
          </button>

          <div
            className="register-link">

            First Time User?

            <Link to="/register">
              Register Here
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default LoginPage;