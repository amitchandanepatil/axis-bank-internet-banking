import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { translations } from "./translations";
import "./App.css";

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:8084"
    : "/api";

function LoginPage() {
  const navigate = useNavigate();
  const mainRef = useRef(null);

  const [loginType, setLoginType] = useState("CUSTOMER_ID");
  const [customerId, setCustomerId] = useState("");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState("en");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  //const t = translations[language];
    const t = translations[language] || translations.en;
  const scrollToMainContent = () => {
    mainRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };

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

  const login = async () => {
    const trimmedCustomerId = customerId.trim();

    if (!trimmedCustomerId || !password) {
      alert("Please enter Customer ID and Password");
      return;
    }

    if (isLoggingIn) {
      return;
    }

    setIsLoggingIn(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customerId: trimmedCustomerId,
          password
        })
      });

      if (response.ok) {
        const customer = await response.json();

        localStorage.setItem(
          "customer",
          JSON.stringify(customer)
        );

        navigate("/dashboard");
      } else {
        const errorMessage = await response.text();

        alert(
          errorMessage ||
            "Invalid Customer ID or Password"
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Unable to connect to the backend server.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    login();
  };

  return (
    <div className="axis-login-page">
      <div className="axis-top-strip">
        <span onClick={scrollToMainContent}>
          {t.skipToMainContent}
        </span>

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
  onChange={(event) => setLanguage(event.target.value)}
  aria-label="Select language"
>
  <option value="en">English</option>
  <option value="hi">Hindi</option>
  <option value="mr">Marathi</option>
  <option value="bn">Bengali</option>
  <option value="te">Telugu</option>
  <option value="ta">Tamil</option>
  <option value="gu">Gujarati</option>
  <option value="kn">Kannada</option>
  <option value="or">Odia</option>
</select>
          <button type="button">
            📱 {t.mobileBanking}
          </button>
        </div>
      </header>

      <main
        className="axis-login-hero"
        ref={mainRef}
      >
        <div className="axis-login-card">
          <h2>{t.loginUsing}</h2>

          <div className="login-tabs">
            <button
              type="button"
              className={
                loginType === "CUSTOMER_ID"
                  ? "active-tab"
                  : ""
              }
              onClick={() =>
                setLoginType("CUSTOMER_ID")
              }
            >
              {t.customerId}
            </button>

            <button
              type="button"
              className={
                loginType === "DEBIT_CARD"
                  ? "active-tab"
                  : ""
              }
              onClick={() =>
                setLoginType("DEBIT_CARD")
              }
            >
              {t.debitCardNo}
            </button>
          </div>

          {loginType === "CUSTOMER_ID" && (
            <form onSubmit={handleLoginSubmit}>
              <label htmlFor="customerId">
                {t.customerId} <span>*</span>
              </label>

              <input
                id="customerId"
                type="text"
                placeholder={t.enterId}
                value={customerId}
                onChange={(event) =>
                  setCustomerId(event.target.value)
                }
                autoComplete="username"
              />

              <div className="small-links">
                <span>{t.forgotCustomerId}</span>
                <span>{t.enableLoginId}</span>
              </div>

              <label htmlFor="loginPassword">
                {t.password} <span>*</span>
              </label>

              <div className="password-input-wrapper">
  <input
    id="loginPassword"
    type={showPassword ? "text" : "password"}
    placeholder={t.enterPassword}
    value={password}
    onChange={(event) => setPassword(event.target.value)}
    autoComplete="current-password"
  />

  <button
    type="button"
    className="password-toggle-btn"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? "Hide" : "Show"}
  </button>
</div>
              <div className="forgot-password-link">
                <Link to="/forgot-password">
                  {t.forgotPassword || "Forgot password"}
                </Link>
              </div>

              <label htmlFor="loginDestination">
                {t.loginDirectlyTo}
              </label>

              <select id="loginDestination">
                <option>{t.dashboard}</option>
              </select>

              <button
                type="submit"
                className="axis-login-btn"
                disabled={isLoggingIn}
              >
                {isLoggingIn
                  ? "Logging in..."
                  : t.login}
              </button>
            </form>
          )}

          {loginType === "DEBIT_CARD" && (
            <>
              <label htmlFor="debitCardNumber">
                {t.debitCardNo} <span>*</span>
              </label>

              <input
                id="debitCardNumber"
                type="text"
                placeholder="5555-5555-5555-5555"
                inputMode="numeric"
              />

              <label htmlFor="atmPin">
                ATM PIN <span>*</span>
              </label>

              <input
                id="atmPin"
                type="password"
                placeholder="Enter PIN"
                inputMode="numeric"
              />

              <label htmlFor="debitLoginDestination">
                {t.loginDirectlyTo}
              </label>

              <select id="debitLoginDestination">
                <option>{t.dashboard}</option>
              </select>

              <button
                type="button"
                className="axis-login-btn disabled-btn"
                disabled
              >
                {t.getOtp}
              </button>
            </>
          )}

          <p className="first-user">
            {t.firstTimeUser}
            <Link to="/register">
              {" "}
              {t.registerHere}
            </Link>
          </p>
        </div>

        <div className="axis-hero-content">
          <h3>{t.welcomeToAxisBank}</h3>
          <h1>{t.internetBanking}</h1>

          <div className="help-pills">
            <span>{t.needHelp}</span>
            <span>▶ {t.watchDemo}</span>
            <span>❔ {t.faqs}</span>
          </div>

          <div className="customer-care-box">
            ☎ {t.customerCare} 1800 209 5577 /
            1800 103 5577
          </div>
        </div>
      </main>

      <section className="axis-info-section">
        <div>
          <div className="round-icon">🛡️</div>
          <h3>{t.secureReliable}</h3>
          <p>{t.secureText}</p>
          <b>{t.knowMore}</b>
        </div>

        <div>
          <div className="round-icon">🎧</div>
          <h3>{t.getInTouch}</h3>
          <p>{t.touchText}</p>
          <b>{t.knowMore}</b>
        </div>

        <div>
          <div className="round-icon">📱</div>
          <h3>{t.getMobileApp}</h3>
          <p>{t.mobileText}</p>
          <b>{t.download}</b>
        </div>
      </section>

      <footer className="axis-footer">
        <span>
          ©2013-2018, Axis Bank | All Rights Reserved.
        </span>

        <span>
          Disclaimer | Privacy policy | Best View
        </span>
      </footer>
    </div>
  );
}

export default LoginPage;