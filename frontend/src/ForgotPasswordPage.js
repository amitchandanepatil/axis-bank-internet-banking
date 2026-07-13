import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";
import { translations } from "./translations";

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:8084"
    : "/api";

const INITIAL_FORM = {
  customerId: "",
  mobileNumber: "",
  otp: "",
  newPassword: "",
  confirmPassword: ""
};

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("en");

const t = translations[language] || translations.en;

const setSmallFont = () => {
  document.body.classList.remove(
    "normal-font",
    "large-font"
  );
  document.body.classList.add("small-font");
};

const setNormalFont = () => {
  document.body.classList.remove(
    "small-font",
    "large-font"
  );
  document.body.classList.add("normal-font");
};

const setLargeFont = () => {
  document.body.classList.remove(
    "small-font",
    "normal-font"
  );
  document.body.classList.add("large-font");
};

const enableHighContrast = () => {
  document.body.classList.add("high-contrast");
};

const disableHighContrast = () => {
  document.body.classList.remove("high-contrast");
};

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [currentStep, setCurrentStep] = useState(1);
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const validatePassword = (password) => {
    if (!password) {
      return "New password is required.";
    }

    if (password.length < 8 || password.length > 30) {
      return "Password must contain 8 to 30 characters.";
    }

    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }

    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter.";
    }

    if (!/\d/.test(password)) {
      return "Password must contain at least one number.";
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      return "Password must contain at least one special character.";
    }

    if (/\s/.test(password)) {
      return "Password must not contain spaces.";
    }

    return "";
  };

  const errors = useMemo(() => {
    const validationErrors = {};

    if (!formData.customerId.trim()) {
      validationErrors.customerId = "Customer ID is required.";
    }

    if (!formData.mobileNumber.trim()) {
      validationErrors.mobileNumber = "Mobile number is required.";
    } else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      validationErrors.mobileNumber =
        "Enter a valid 10-digit registered mobile number.";
    }

    if (currentStep >= 2) {
      if (!formData.otp.trim()) {
        validationErrors.otp = "OTP is required.";
      } else if (!/^\d{6}$/.test(formData.otp)) {
        validationErrors.otp = "OTP must contain exactly 6 digits.";
      }
    }

    if (currentStep >= 3) {
      const passwordError = validatePassword(formData.newPassword);

      if (passwordError) {
        validationErrors.newPassword = passwordError;
      }

      if (!formData.confirmPassword) {
        validationErrors.confirmPassword =
          "Please confirm your new password.";
      } else if (
        formData.confirmPassword !== formData.newPassword
      ) {
        validationErrors.confirmPassword =
          "New password and confirm password do not match.";
      }
    }

    return validationErrors;
  }, [formData, currentStep]);

  const handleChange = (event) => {
    const { name } = event.target;
    let { value } = event.target;

    if (name === "mobileNumber" || name === "otp") {
      value = value.replace(/\D/g, "");
    }

    setFormData((currentData) => ({
      ...currentData,
      [name]: value
    }));

    setMessage("");
  };

  const handleBlur = (event) => {
    setTouched((currentTouched) => ({
      ...currentTouched,
      [event.target.name]: true
    }));
  };

  const showError = (fieldName) =>
    touched[fieldName] && errors[fieldName];

  const showResponseMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
  };

  const readResponse = async (response) => {
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      const data = await response.json();

      return data.message || data.error || "Request completed.";
    }

    return response.text();
  };

  const sendOtp = async (event) => {
    event.preventDefault();

    setTouched({
      customerId: true,
      mobileNumber: true
    });

    if (errors.customerId || errors.mobileNumber || isLoading) {
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/auth/forgot-password/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            customerId: formData.customerId.trim(),
            mobileNumber: formData.mobileNumber.trim()
          })
        }
      );

      const responseMessage = await readResponse(response);

      if (!response.ok) {
        showResponseMessage(
          responseMessage || "Unable to generate OTP.",
          "error"
        );
        return;
      }

      showResponseMessage(
        responseMessage ||
          "OTP has been generated successfully.",
        "success"
      );

      setCurrentStep(2);
      setTouched({});
    } catch (error) {
      console.error("Send OTP error:", error);

      showResponseMessage(
        "Unable to connect to the server.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();

    setTouched((currentTouched) => ({
      ...currentTouched,
      otp: true
    }));

    if (errors.otp || isLoading) {
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/auth/forgot-password/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            customerId: formData.customerId.trim(),
            mobileNumber: formData.mobileNumber.trim(),
            otp: formData.otp.trim()
          })
        }
      );

      const responseMessage = await readResponse(response);

      if (!response.ok) {
        showResponseMessage(
          responseMessage || "OTP verification failed.",
          "error"
        );
        return;
      }

      showResponseMessage(
        responseMessage || "OTP verified successfully.",
        "success"
      );

      setCurrentStep(3);
      setTouched({});
    } catch (error) {
      console.error("Verify OTP error:", error);

      showResponseMessage(
        "Unable to connect to the server.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();

    setTouched({
      newPassword: true,
      confirmPassword: true
    });

    if (
      errors.newPassword ||
      errors.confirmPassword ||
      isLoading
    ) {
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/auth/forgot-password/reset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            customerId: formData.customerId.trim(),
            mobileNumber: formData.mobileNumber.trim(),
            otp: formData.otp.trim(),
            newPassword: formData.newPassword
          })
        }
      );

      const responseMessage = await readResponse(response);

      if (!response.ok) {
        showResponseMessage(
          responseMessage || "Password reset failed.",
          "error"
        );
        return;
      }

      alert(
        responseMessage ||
          "Password reset successfully. Please login with your new password."
      );

      setFormData(INITIAL_FORM);
      navigate("/");
    } catch (error) {
      console.error("Reset password error:", error);

      showResponseMessage(
        "Unable to connect to the server.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    await sendOtp({
      preventDefault: () => {}
    });

    setFormData((currentData) => ({
      ...currentData,
      otp: ""
    }));
  };

  return (
    <div className="forgot-password-page">
      <div className="axis-top-strip">
  <span>{t.skipToMainContent}</span>
  <span>|</span>

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

<header className="axis-header">
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

  <div className="axis-header-links">
    <span>{t.axisGroup}</span>
    <span>{t.aboutUs}</span>
    <span>{t.customerCare}</span>
    <span>{t.findAtmBranch}</span>

    <select
      className="language-select"
      value={language}
      onChange={(event) =>
        setLanguage(event.target.value)
      }
      aria-label="Select language"
    >
      <option value="en">English</option>
      <option value="hi">हिन्दी</option>
      <option value="mr">मराठी</option>
    </select>

    <Link
      to="/"
      className="forgot-header-back-button"
    >
      Back to Login
    </Link>
  </div>
</header>
      <main className="forgot-password-main">
        <div className="forgot-password-card">
          <div className="forgot-password-title">
            <div className="forgot-lock-icon">🔒</div>

            <div>
              <h1>Forgot Password</h1>

              <p>
                Reset your Internet Banking password securely.
              </p>
            </div>
          </div>

          <div className="forgot-step-wrapper">
            <div
              className={`forgot-step ${
                currentStep >= 1 ? "active" : ""
              }`}
            >
              <span>1</span>
              <p>Verify Account</p>
            </div>

            <div
              className={`forgot-step-line ${
                currentStep >= 2 ? "active" : ""
              }`}
            />

            <div
              className={`forgot-step ${
                currentStep >= 2 ? "active" : ""
              }`}
            >
              <span>2</span>
              <p>Verify OTP</p>
            </div>

            <div
              className={`forgot-step-line ${
                currentStep >= 3 ? "active" : ""
              }`}
            />

            <div
              className={`forgot-step ${
                currentStep >= 3 ? "active" : ""
              }`}
            >
              <span>3</span>
              <p>New Password</p>
            </div>
          </div>

          {message && (
            <div
              className={`forgot-message forgot-message-${messageType}`}
            >
              {message}
            </div>
          )}

          {currentStep === 1 && (
            <form onSubmit={sendOtp}>
              <div className="forgot-form-section">
                <h2>Verify your account</h2>

                <p>
                  Enter your Customer ID and registered mobile
                  number.
                </p>

                <div className="forgot-field">
                  <label htmlFor="customerId">
                    Login ID / Customer ID <span>*</span>
                  </label>

                  <input
                    id="customerId"
                    name="customerId"
                    type="text"
                    placeholder="Enter Customer ID"
                    value={formData.customerId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="username"
                    className={
                      showError("customerId")
                        ? "forgot-input-error"
                        : ""
                    }
                  />

                  {showError("customerId") && (
                    <small>{errors.customerId}</small>
                  )}
                </div>

                <div className="forgot-field">
                  <label htmlFor="mobileNumber">
                    Registered Mobile Number <span>*</span>
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
                        ? "forgot-input-error"
                        : ""
                    }
                  />

                  {showError("mobileNumber") && (
                    <small>{errors.mobileNumber}</small>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="forgot-primary-button"
                disabled={isLoading}
              >
                {isLoading ? "Generating OTP..." : "Generate OTP"}
              </button>
            </form>
          )}

          {currentStep === 2 && (
            <form onSubmit={verifyOtp}>
              <div className="forgot-form-section">
                <h2>Verify OTP</h2>

                <p>
                  Enter the 6-digit OTP generated for your
                  registered mobile number.
                </p>

                <div className="forgot-mobile-summary">
                  OTP generated for mobile number ending with{" "}
                  <strong>
                    {formData.mobileNumber.slice(-4)}
                  </strong>
                </div>

                <div className="forgot-field">
                  <label htmlFor="otp">
                    One Time Password <span>*</span>
                  </label>

                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={formData.otp}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className={`forgot-otp-input ${
                      showError("otp")
                        ? "forgot-input-error"
                        : ""
                    }`}
                  />

                  {showError("otp") && (
                    <small>{errors.otp}</small>
                  )}
                </div>

                <button
                  type="button"
                  className="forgot-resend-button"
                  onClick={resendOtp}
                  disabled={isLoading}
                >
                  Resend OTP
                </button>
              </div>

              <div className="forgot-action-row">
                <button
                  type="button"
                  className="forgot-secondary-button"
                  onClick={() => {
                    setCurrentStep(1);
                    setMessage("");
                    setTouched({});
                  }}
                >
                  Back
                </button>

                <button
                  type="submit"
                  className="forgot-primary-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            </form>
          )}

          {currentStep === 3 && (
            <form onSubmit={resetPassword}>
              <div className="forgot-form-section">
                <h2>Create new password</h2>

                <p>
                  Your new password must be different from your
                  previous password.
                </p>

                <div className="forgot-field">
                  <label htmlFor="newPassword">
                    New Password <span>*</span>
                  </label>

                  <div className="forgot-password-input-wrapper">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      maxLength={30}
                      autoComplete="new-password"
                      className={
                        showError("newPassword")
                          ? "forgot-input-error"
                          : ""
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((value) => !value)
                      }
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  {showError("newPassword") && (
                    <small>{errors.newPassword}</small>
                  )}
                </div>

                <div className="forgot-password-rules">
                  <span>
                    ✓ Minimum 8 characters
                  </span>

                  <span>
                    ✓ Uppercase and lowercase letter
                  </span>

                  <span>✓ Number and special character</span>
                </div>

                <div className="forgot-field">
                  <label htmlFor="confirmPassword">
                    Confirm New Password <span>*</span>
                  </label>

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength={30}
                    autoComplete="new-password"
                    className={
                      showError("confirmPassword")
                        ? "forgot-input-error"
                        : ""
                    }
                  />

                  {showError("confirmPassword") && (
                    <small>{errors.confirmPassword}</small>
                  )}
                </div>
              </div>

              <div className="forgot-action-row">
                <button
                  type="button"
                  className="forgot-secondary-button"
                  onClick={() => {
                    setCurrentStep(2);
                    setMessage("");
                    setTouched({});
                  }}
                >
                  Back
                </button>

                <button
                  type="submit"
                  className="forgot-primary-button"
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Resetting Password..."
                    : "Reset Password"}
                </button>
              </div>
            </form>
          )}

          <div className="forgot-security-note">
            <span>🛡️</span>

            <p>
              Never share your OTP, password, ATM PIN or CVV
              with anyone, including bank representatives.
            </p>
          </div>

          <p className="forgot-login-link">
            Remember your password? <Link to="/">Login securely</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default ForgotPasswordPage;