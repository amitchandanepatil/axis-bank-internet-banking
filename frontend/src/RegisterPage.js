import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";

function RegisterPage() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    email: "",
    aadhaarNumber: "",
    panNumber: "",
    accountNumber: "",
    password: "",
    confirmPassword: "",
    accountType: "SAVINGS"
  });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const register = async () => {

    if (
      formData.password !==
      formData.confirmPassword
    ) {

      alert(
        "Password and Confirm Password must match"
      );

      return;
    }

    try {

      const response =
        await fetch(
          "http://localhost:8084/auth/register",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify(formData)
          }
        );

      const result =
        await response.text();

      alert(result);

      if (
        result.includes(
          "Registration Successful"
        )
      ) {

        navigate("/");
      }

    } catch {

      alert(
        "Backend not running"
      );
    }
  };

  return (

    <div className="register-page">

      <div className="register-box">

        <h1>
          First Time User Registration
        </h1>

        <p>
          Create Internet Banking Access
        </p>

        <input
          name="fullName"
          placeholder="Full Name"
          onChange={handleChange}
        />

        <input
          name="mobileNumber"
          placeholder="Mobile Number"
          onChange={handleChange}
        />

        <input
          name="email"
          placeholder="Email Address"
          onChange={handleChange}
        />

        <input
          name="aadhaarNumber"
          placeholder="Aadhaar Number"
          onChange={handleChange}
        />

        <input
          name="panNumber"
          placeholder="PAN Number"
          onChange={handleChange}
        />

        <input
          name="accountNumber"
          placeholder="Account Number"
          onChange={handleChange}
        />

        <select
          name="accountType"
          onChange={handleChange}
        >

          <option value="SAVINGS">
            Savings Account
          </option>

          <option value="CURRENT">
            Current Account
          </option>

        </select>

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          onChange={handleChange}
        />

        <button
          className="register-btn"
          onClick={register}
        >
          Register
        </button>

        <div className="register-footer">

          Already Registered?

          <Link to="/">
            Login
          </Link>

        </div>

      </div>

    </div>
  );
}

export default RegisterPage;