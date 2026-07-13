import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:8084"
    : "/api";

const INITIAL_FORM_DATA = {
  fullName: "",
  mobileNumber: "",
  email: "",
  aadhaarNumber: "",
  panNumber: "",
  accountNumber: "",
  accountType: "SAVINGS",
  password: "",
  confirmPassword: ""
};

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const setSmallFont = () => {
    document.body.classList.remove("normal-font", "large-font");
    document.body.classList.add("small-font");
  };

  const setNormalFont = () => {
    document.body.classList.remove("small-font", "large-font");
    document.body.classList.add("normal-font");
  };

  const setLargeFont = () => {
    document.body.classList.remove("small-font", "normal-font");
    document.body.classList.add("large-font");
  };

  const enableHighContrast = () => {
    document.body.classList.add("high-contrast");
  };

  const disableHighContrast = () => {
    document.body.classList.remove("high-contrast");
  };

  const validateForm = (values) => {
    const errors = {};

    const fullName = values.fullName.trim();
    const mobileNumber = values.mobileNumber.trim();
    const email = values.email.trim();
    const aadhaarNumber = values.aadhaarNumber.trim();
    const panNumber = values.panNumber.trim().toUpperCase();
    const accountNumber = values.accountNumber.trim();
    const password = values.password;

    if (!fullName) {
      errors.fullName = "Full name is required.";
    } else if (!/^[A-Za-z][A-Za-z\s.'-]{2,49}$/.test(fullName)) {
      errors.fullName = "Enter a valid name containing 3 to 50 characters.";
    }

    if (!mobileNumber) {
      errors.mobileNumber = "Mobile number is required.";
    } else if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      errors.mobileNumber = "Enter a valid 10-digit Indian mobile number.";
    }

    if (!email) {
      errors.email = "Email address is required.";
    } else if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)
    ) {
      errors.email = "Enter a valid email address.";
    }

    if (!aadhaarNumber) {
      errors.aadhaarNumber = "Aadhaar number is required.";
    } else if (!/^[2-9]\d{11}$/.test(aadhaarNumber)) {
      errors.aadhaarNumber = "Enter a valid 12-digit Aadhaar number.";
    }

    if (!panNumber) {
      errors.panNumber = "PAN number is required.";
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panNumber)) {
      errors.panNumber = "PAN must follow the format ABCDE1234F.";
    }

    if (!accountNumber) {
      errors.accountNumber = "Account number is required.";
    } else if (!/^\d{15}$/.test(accountNumber)) {
      errors.accountNumber = "Account number must contain exactly 15 digits.";
    }

    if (!values.accountType) {
      errors.accountType = "Select an account type.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 8 || password.length > 30) {
      errors.password = "Password must contain 8 to 30 characters.";
    } else if (!/[A-Z]/.test(password)) {
      errors.password = "Password must contain at least one uppercase letter.";
    } else if (!/[a-z]/.test(password)) {
      errors.password = "Password must contain at least one lowercase letter.";
    } else if (!/\d/.test(password)) {
      errors.password = "Password must contain at least one number.";
    } else if (
      !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    ) {
      errors.password = "Password must contain at least one special character.";
    } else if (/\s/.test(password)) {
      errors.password = "Password must not contain spaces.";
    }

    if (!values.confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (values.confirmPassword !== password) {
      errors.confirmPassword = "Password and confirm password do not match.";
    }

    return errors;
  };

  const errors = useMemo(() => validateForm(formData), [formData]);
  const isFormValid = Object.keys(errors).length === 0;

  const getPasswordStrength = (password) => {
    if (!password) {
      return {
        level: 0,
        label: "",
        className: ""
      };
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      score++;
    }

    if (score <= 2) {
      return {
        level: 33,
        label: "Weak",
        className: "password-strength-weak"
      };
    }

    if (score <= 4) {
      return {
        level: 66,
        label: "Almost there",
        className: "password-strength-medium"
      };
    }

    return {
      level: 100,
      label: "Strong password",
      className: "password-strength-strong"
    };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (event) => {
    const { name } = event.target;
    let { value } = event.target;

    if (
      name === "mobileNumber" ||
      name === "aadhaarNumber" ||
      name === "accountNumber"
    ) {
      value = value.replace(/\D/g, "");
    }

    if (name === "panNumber") {
      value = value
        .replace(/[^A-Za-z0-9]/g, "")
        .toUpperCase();
    }

    setFormData((currentData) => ({
      ...currentData,
      [name]: value
    }));
  };

  const handleBlur = (event) => {
    setTouched((currentTouched) => ({
      ...currentTouched,
      [event.target.name]: true
    }));
  };

  const markAllFieldsTouched = () => {
    setTouched(
      Object.keys(INITIAL_FORM_DATA).reduce(
        (result, fieldName) => ({
          ...result,
          [fieldName]: true
        }),
        {}
      )
    );
  };

  const register = async () => {
    markAllFieldsTouched();

    if (!isFormValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const registrationRequest = {
        fullName: formData.fullName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        email: formData.email.trim().toLowerCase(),
        aadhaarNumber: formData.aadhaarNumber.trim(),
        panNumber: formData.panNumber.trim().toUpperCase(),
        accountNumber: formData.accountNumber.trim(),
        accountType: formData.accountType,
        password: formData.password
      };

      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(registrationRequest)
      });

      const result = await response.text();

      if (!response.ok) {
        alert(
          result ||
            "Registration failed. Please verify your details."
        );
        return;
      }

      alert(result || "Registration Successful");

      setFormData(INITIAL_FORM_DATA);
      setTouched({});
      navigate("/");
    } catch (error) {
      console.error(error);

      alert(
        "Unable to connect to the server. Please verify that the backend is running."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    register();
  };

  const showError = (fieldName) =>
    touched[fieldName] && errors[fieldName];

  return (
    <div className="axis-register-page">
      <div className="axis-top-strip register-top-strip">
        <span onClick={setSmallFont}>A-</span>

        <span
          className="black-box"
          onClick={enableHighContrast}
        >
          A
        </span>

        <span onClick={setLargeFont}>A+</span>

        <span
          className="pink-box"
          onClick={disableHighContrast}
        >
          A
        </span>

        <span
          className="outline-box"
          onClick={setNormalFont}
        >
          A
        </span>
      </div>

      <header className="axis-header register-axis-header">
        <div className="axis-header-left">
          <img
            src="https://www.axis.bank.in/assets/images/logo-white.png"
            alt="Axis Bank"
          />
        </div>

        <div className="open-text">
          <span className="open-word">open</span>
          <span className="divider">|</span>
          <span className="internet-text">
            INTERNET BANKING
          </span>
        </div>

        <div className="register-header-actions">
          <span>Secure Registration</span>

          <Link
            to="/"
            className="register-header-login"
          >
            Login
          </Link>
        </div>
      </header>

      <main className="register-main">
        <div className="register-breadcrumb">
          <Link to="/">Back to Login</Link>
          <span>/</span>
          <span>First Time User Registration</span>
        </div>

        <section className="register-intro">
          <div>
            <p className="register-eyebrow">
              Internet Banking Registration
            </p>

            <h1>First Time User Registration</h1>

            <p>
              Create secure access to manage your Axis
              Bank account online.
            </p>
          </div>

          <div className="register-security-badge">
            <span>🔒</span>

            <div>
              <strong>Secure and protected</strong>
              <p>Your information is encrypted.</p>
            </div>
          </div>
        </section>

        <div className="register-layout">
          <aside className="register-benefits">
            <div className="register-benefit-icon">
              🏦
            </div>

            <h2>Banking made simple</h2>

            <p>
              Register once to access your accounts,
              deposits, transfers and transaction history.
            </p>

            <div className="register-benefit-item">
              <span>✓</span>
              <p>24×7 access to your accounts</p>
            </div>

            <div className="register-benefit-item">
              <span>✓</span>
              <p>Secure fund transfers</p>
            </div>

            <div className="register-benefit-item">
              <span>✓</span>
              <p>
                Open and manage FD and RD accounts
              </p>
            </div>

            <div className="register-benefit-item">
              <span>✓</span>
              <p>
                Download receipts and view transactions
              </p>
            </div>

            <div className="register-safety-note">
              <strong>Safety reminder</strong>

              <p>
                Never share your password, OTP or card PIN
                with anyone.
              </p>
            </div>
          </aside>

          <form
            className="axis-register-card register-form-card"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="register-form-heading">
              <div>
                <h2>Personal and Account Details</h2>

                <p>
                  All fields marked with * are mandatory.
                </p>
              </div>

              <span>Step 1 of 1</span>
            </div>

            <div className="register-form-grid">
              <div className="register-field">
                <label htmlFor="fullName">
                  Full Name <span>*</span>
                </label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={50}
                  autoComplete="name"
                  className={
                    showError("fullName")
                      ? "input-error"
                      : ""
                  }
                />

                {showError("fullName") && (
                  <small className="field-error">
                    {errors.fullName}
                  </small>
                )}
              </div>

              <div className="register-field">
                <label htmlFor="mobileNumber">
                  Mobile Number <span>*</span>
                </label>

                <input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={10}
                  inputMode="numeric"
                  autoComplete="tel"
                  className={
                    showError("mobileNumber")
                      ? "input-error"
                      : ""
                  }
                />

                {showError("mobileNumber") && (
                  <small className="field-error">
                    {errors.mobileNumber}
                  </small>
                )}
              </div>

              <div className="register-field register-field-full">
                <label htmlFor="email">
                  Email Address <span>*</span>
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={100}
                  autoComplete="email"
                  className={
                    showError("email")
                      ? "input-error"
                      : ""
                  }
                />

                {showError("email") && (
                  <small className="field-error">
                    {errors.email}
                  </small>
                )}
              </div>

              <div className="register-field">
                <label htmlFor="aadhaarNumber">
                  Aadhaar Number <span>*</span>
                </label>

                <input
                  id="aadhaarNumber"
                  name="aadhaarNumber"
                  type="text"
                  placeholder="Enter 12-digit Aadhaar number"
                  value={formData.aadhaarNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={12}
                  inputMode="numeric"
                  autoComplete="off"
                  className={
                    showError("aadhaarNumber")
                      ? "input-error"
                      : ""
                  }
                />

                {showError("aadhaarNumber") && (
                  <small className="field-error">
                    {errors.aadhaarNumber}
                  </small>
                )}
              </div>

              <div className="register-field">
                <label htmlFor="panNumber">
                  PAN Number <span>*</span>
                </label>

                <input
                  id="panNumber"
                  name="panNumber"
                  type="text"
                  placeholder="ABCDE1234F"
                  value={formData.panNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={10}
                  autoCapitalize="characters"
                  autoComplete="off"
                  className={
                    showError("panNumber")
                      ? "input-error"
                      : ""
                  }
                />

                {showError("panNumber") && (
                  <small className="field-error">
                    {errors.panNumber}
                  </small>
                )}
              </div>

              <div className="register-field">
                <label htmlFor="accountNumber">
                  Account Number <span>*</span>
                </label>

                <input
                  id="accountNumber"
                  name="accountNumber"
                  type="text"
                  placeholder="Enter 15-digit account number"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={15}
                  inputMode="numeric"
                  autoComplete="off"
                  className={
                    showError("accountNumber")
                      ? "input-error"
                      : ""
                  }
                />

                {showError("accountNumber") && (
                  <small className="field-error">
                    {errors.accountNumber}
                  </small>
                )}
              </div>

              <div className="register-field">
                <label htmlFor="accountType">
                  Account Type <span>*</span>
                </label>

                <select
                  id="accountType"
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    showError("accountType")
                      ? "input-error"
                      : ""
                  }
                >
                  <option value="SAVINGS">
                    Savings Account
                  </option>

                  <option value="CURRENT">
                    Current Account
                  </option>
                </select>

                {showError("accountType") && (
                  <small className="field-error">
                    {errors.accountType}
                  </small>
                )}
              </div>

              <div className="register-field">
                <label htmlFor="password">
                  Password <span>*</span>
                </label>

                <div className="password-input-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword ? "text" : "password"
                    }
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength={30}
                    autoComplete="new-password"
                    className={
                      showError("password")
                        ? "input-error"
                        : ""
                    }
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (currentValue) => !currentValue
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <div className="password-strength-section">
                  <div className="password-strength-header">
                    <small>Password strength</small>

                    {passwordStrength.label && (
                      <small
                        className={
                          passwordStrength.className
                        }
                      >
                        {passwordStrength.label}
                      </small>
                    )}
                  </div>

                  <div className="password-strength-track">
                    <div
                      className={`password-strength-fill ${passwordStrength.className}`}
                      style={{
                        width: `${passwordStrength.level}%`
                      }}
                    />
                  </div>

                  <div className="password-criteria">
                    <span
                      className={
                        formData.password.length >= 8
                          ? "criteria-complete"
                          : ""
                      }
                    >
                      ✓ 8+ characters
                    </span>

                    <span
                      className={
                        /[A-Z]/.test(formData.password)
                          ? "criteria-complete"
                          : ""
                      }
                    >
                      ✓ Uppercase
                    </span>

                    <span
                      className={
                        /[a-z]/.test(formData.password)
                          ? "criteria-complete"
                          : ""
                      }
                    >
                      ✓ Lowercase
                    </span>

                    <span
                      className={
                        /\d/.test(formData.password)
                          ? "criteria-complete"
                          : ""
                      }
                    >
                      ✓ Number
                    </span>

                    <span
                      className={
                        /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
                          formData.password
                        )
                          ? "criteria-complete"
                          : ""
                      }
                    >
                      ✓ Special character
                    </span>
                  </div>

                  {showError("password") && (
                    <small className="field-error">
                      {errors.password}
                    </small>
                  )}
                </div>
              </div>

              <div className="register-field">
                <label htmlFor="confirmPassword">
                  Confirm Password <span>*</span>
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showPassword ? "text" : "password"
                  }
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={30}
                  autoComplete="new-password"
                  className={
                    showError("confirmPassword")
                      ? "input-error"
                      : ""
                  }
                />

                {showError("confirmPassword") && (
                  <small className="field-error">
                    {errors.confirmPassword}
                  </small>
                )}
              </div>
            </div>

            <div className="register-terms">
              By registering, you confirm that the
              information entered above is accurate and
              belongs to you.
            </div>

            <button
              type="submit"
              className="register-submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Registering..."
                : "Register for Internet Banking"}
            </button>

            <p className="already-user">
              Already registered?
              <Link to="/"> Login securely</Link>
            </p>
          </form>
        </div>
      </main>

      <footer className="axis-footer register-footer">
        <span>
          © 2019 Axis Bank, India | All Rights Reserved
        </span>

        <span>
          Disclaimer | Privacy Policy | Secure Banking
        </span>
      </footer>
    </div>
  );
}

export default RegisterPage;