import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { translations } from "./translations";
import "./App.css";

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:8084"
    : "/api";

function DashboardPage() {
  const navigate = useNavigate();
  const mainRef = useRef(null);

  const [customer, setCustomer] = useState(null);
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [fixedDeposits, setFixedDeposits] = useState([]);
  const [recurringDeposits, setRecurringDeposits] = useState([]);
  const [activeSection, setActiveSection] = useState("DASHBOARD");
  const [language, setLanguage] = useState("en");
  const [fdToClose, setFdToClose] = useState(null);
  const [rdToClose, setRdToClose] = useState(null);
  const [transferData, setTransferData] = useState({
    toAccount: "",
    amount: "",
    remarks: ""
  });

  const [fdData, setFdData] = useState({
    principalAmount: "",
    tenureDays: 365,
    seniorCitizen: false
  });
  const [rdData, setRdData] = useState({
  monthlyInstallment: "",
  tenureMonths: 24,
  seniorCitizen: false
});

  const t = translations[language] || translations.en;

  const text = (key, fallback) => t[key] || translations.en[key] || fallback;
  const upper = (value, fallback) =>
    String(value || fallback || "").toUpperCase();

  const getCustomerName = () => {
    return (
      customer?.fullName ||
      customer?.name ||
      customer?.customerName ||
      customer?.username ||
      "Customer"
    );
  };

  const scrollToMainContent = () => {
    mainRef.current?.scrollIntoView({ behavior: "smooth" });
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

  const formatISTDateTime = (dateValue) => {
    if (!dateValue) return "-";

    return new Date(dateValue).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
  };

  const getFdRate = (tenureDays, seniorCitizen) => {
    let rate = 3.0;

    if (tenureDays >= 7 && tenureDays <= 45) rate = 3.0;
    else if (tenureDays >= 46 && tenureDays <= 60) rate = 4.25;
    else if (tenureDays >= 61 && tenureDays <= 90) rate = 4.5;
    else if (tenureDays >= 91 && tenureDays <= 180) rate = 4.75;
    else if (tenureDays >= 181 && tenureDays <= 270) rate = 5.5;
    else if (tenureDays >= 271 && tenureDays <= 364) rate = 5.75;
    else if (tenureDays >= 365 && tenureDays <= 455) rate = 6.25;
    else if (tenureDays >= 456 && tenureDays <= 3650) rate = 6.45;

    return seniorCitizen ? rate + 0.5 : rate;
  };

  const calculateFdMaturity = () => {
    const principal = Number(fdData.principalAmount || 0);
    const tenure = Number(fdData.tenureDays || 0);
    const rate = getFdRate(tenure, fdData.seniorCitizen);
    const years = tenure / 365;
    return Math.round((principal + (principal * rate * years) / 100) * 100) / 100;
  };

  const calculateFdMaturityDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + Number(fdData.tenureDays || 0));
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };
  const getRdRate = (tenureMonths, seniorCitizen) => {
  let rate = 6.25;

  if (tenureMonths <= 12) rate = 6.25;
  else if (tenureMonths <= 24) rate = 6.75;
  else if (tenureMonths <= 60) rate = 7.0;
  else rate = 6.75;

  return seniorCitizen ? rate + 0.5 : rate;
};

const calculateRdMaturity = () => {
  const monthlyInstallment = Number(rdData.monthlyInstallment || 0);
  const tenure = Number(rdData.tenureMonths || 0);
  const rate = getRdRate(tenure, rdData.seniorCitizen);

  const monthlyRate = rate / 12 / 100;
  let maturityAmount = 0;

  for (let month = 1; month <= tenure; month++) {
    const remainingMonths = tenure - month + 1;
    maturityAmount +=
      monthlyInstallment *
      Math.pow(1 + monthlyRate, remainingMonths);
  }

  return Math.round(maturityAmount * 100) / 100;
};
const formatCurrency = (amount) => {
  return Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};
const calculateRdMaturityDate = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + Number(rdData.tenureMonths || 0));

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

  const refreshDashboardData = (loggedInCustomer) => {
    fetch(`${API_BASE}/account/${loggedInCustomer.customerId}`)
      .then((response) => response.json())
      .then((accountData) => {
        setAccount(accountData);
        return fetch(`${API_BASE}/transaction/${accountData.accountNumber}`);
      })
      .then((response) => response.json())
      .then((transactionData) => setTransactions(transactionData))
      .catch((error) => console.log(error));

    fetch(`${API_BASE}/fd/customer/${loggedInCustomer.customerId}`)
      .then((response) => response.json())
      .then((data) => setFixedDeposits(Array.isArray(data) ? data : []))
      .catch((error) => console.log(error));

      fetch(`${API_BASE}/rd/customer/${loggedInCustomer.customerId}`)
  .then((response) => response.json())
  .then((data) => setRecurringDeposits(Array.isArray(data) ? data : []))
  .catch((error) => console.log(error));
  };

  useEffect(() => {
    const customerData = localStorage.getItem("customer");

    if (!customerData) {
      navigate("/");
      return;
    }

    const loggedInCustomer = JSON.parse(customerData);
    setCustomer(loggedInCustomer);
    refreshDashboardData(loggedInCustomer);
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("customer");
    navigate("/");
  };

  const handleFundTransfer = async () => {
    if (!transferData.toAccount || !transferData.amount) {
      alert("Please enter beneficiary account number and amount");
      return;
    }

    if (Number(transferData.amount) <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/transaction/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fromAccount: account.accountNumber,
          toAccount: transferData.toAccount,
          amount: Number(transferData.amount),
          remarks: transferData.remarks
        })
      });

      const result = await response.text();
      alert(result);

      if (result === "Fund Transfer Successful") {
        setTransferData({
          toAccount: "",
          amount: "",
          remarks: ""
        });

        refreshDashboardData(customer);
        setActiveSection("TRANSACTIONS");
      }
    } catch (error) {
      console.log(error);
      alert("Transfer failed. Please try again.");
    }
  };

  const openFixedDeposit = async () => {
    if (!fdData.principalAmount || Number(fdData.principalAmount) < 5000) {
      alert("Minimum FD amount is ₹5000");
      return;
    }

    if (!account?.accountNumber) {
      alert("Account details not loaded");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/fd/open`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customerId: customer.customerId,
          accountNumber: account.accountNumber,
          principalAmount: Number(fdData.principalAmount),
          tenureDays: Number(fdData.tenureDays),
          seniorCitizen: fdData.seniorCitizen
        })
      });

      if (!response.ok) {
        const message = await response.text();
        alert(message || "Unable to open FD");
        return;
      }

      const fd = await response.json();

      alert(`FD Created Successfully\nFD Account Number: ${fd.fdAccountNumber}`);

      setFdData({
        principalAmount: "",
        tenureDays: 365,
        seniorCitizen: false
      });

      refreshDashboardData(customer);
      setActiveSection("MY_FD");
    } catch (error) {
      console.log(error);
      alert("Unable to create FD");
    }
  };
  const openRecurringDeposit = async () => {
  if (!rdData.monthlyInstallment) {
    alert("Please enter monthly installment amount.");
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE}/rd/open`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customerId: customer.customerId,
          accountNumber: account.accountNumber,
          monthlyInstallment: Number(
            rdData.monthlyInstallment
          ),
          tenureMonths: Number(
            rdData.tenureMonths
          ),
          seniorCitizen:
            rdData.seniorCitizen
        })
      }
    );

    if (!response.ok) {
      const message =
        await response.text();

      alert(
        message ||
          "Unable to open RD"
      );

      return;
    }

    const rd =
      await response.json();

    alert(
      `Recurring Deposit created successfully.\nRD Number: ${rd.rdAccountNumber}`
    );

    setRdData({
      monthlyInstallment: "",
      tenureMonths: 24,
      seniorCitizen: false
    });

    refreshDashboardData(customer);
    setActiveSection("RD");
  } catch (error) {
    console.log(error);
    alert(
      "Unable to open Recurring Deposit."
    );
  }
};

 const openFdCloseModal = (fdNumber) => {
  const fd = fixedDeposits.find(
    (item) => item.fdAccountNumber === fdNumber
  );

  if (fd) {
    setFdToClose(fd);
  }
};

const confirmCloseFixedDeposit = async () => {
  if (!fdToClose) {
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE}/fd/close/${fdToClose.fdAccountNumber}`,
      {
        method: "PUT"
      }
    );

    if (!response.ok) {
      const message = await response.text();
      alert(message || "Unable to close FD");
      return;
    }

    const closedFd = await response.json();

    alert(
      `FD Closed Successfully\nClosure Type: ${closedFd.closureType}\nClosure Amount: ₹${closedFd.closureAmount}`
    );

    setFdToClose(null);
    refreshDashboardData(customer);
  } catch (error) {
    console.log(error);
    alert("Unable to close FD");
  }
};

const openRdCloseModal = (rdNumber) => {
  const rd = recurringDeposits.find(
    (item) => item.rdAccountNumber === rdNumber
  );

  if (rd) {
    setRdToClose(rd);
  }
};

const confirmCloseRecurringDeposit = async () => {
  if (!rdToClose) return;

  try {
    const response = await fetch(
      `${API_BASE}/rd/close/${rdToClose.rdAccountNumber}`,
      {
        method: "PUT"
      }
    );

    if (!response.ok) {
      const message = await response.text();
      alert(message || "Unable to close RD");
      return;
    }

    const closedRd = await response.json();

    alert(
      `RD Closed Successfully\nClosure Type: ${closedRd.closureType}\nClosure Amount: ₹${closedRd.closureAmount}`
    );

    setRdToClose(null);
    refreshDashboardData(customer);
  } catch (error) {
    console.log(error);
    alert("Unable to close RD");
  }
};



const downloadRdReceipt = (rdAccountNumber) => {
  window.open(
    `${API_BASE}/rd/receipt/${rdAccountNumber}`,
    "_blank"
  );
};

const downloadFdReceipt = (fdAccountNumber) => {
  window.open(
    `${API_BASE}/fd/receipt/${fdAccountNumber}`,
    "_blank"
  );
};


  const getSectionTitle = () => {
    if (activeSection === "ACCOUNTS") return text("accounts", "Accounts");
    if (activeSection === "FD") return text("fixedDeposit", "Fixed Deposit");
    if (activeSection === "MY_FD") return "My Deposits";
    if (activeSection === "RD") return text("recurringDeposit", "Recurring Deposit");
    if (activeSection === "FUND_TRANSFER") return text("fundTransfer", "Fund Transfer");
    if (activeSection === "TRANSACTIONS") return text("transactions", "Transactions");
    if (activeSection === "PROFILE") return text("profile", "Profile");
    return text("dashboard", "Dashboard");
  };

  if (!customer) return null;
  const activeFds = fixedDeposits.filter((fd) => fd.status === "ACTIVE");

const totalFdInvestment = activeFds.reduce(
  (sum, fd) => sum + Number(fd.principalAmount || 0),
  0
);

const totalFdMaturity = activeFds.reduce(
  (sum, fd) => sum + Number(fd.maturityAmount || 0),
  0
);

const activeRds = recurringDeposits.filter(
  (rd) => rd.status === "ACTIVE"
);

const totalRdInvestment = activeRds.reduce(
  (sum, rd) =>
    sum +
    Number(rd.monthlyInstallment || 0) *
      Number(rd.paidInstallments || 0),
  0
);

const totalRdMaturity = activeRds.reduce(
  (sum, rd) =>
    sum + Number(rd.maturityAmount || 0),
  0
);

  return (
    <div className="dashboard-shell">
      <div className="axis-mini-strip">
        <span onClick={scrollToMainContent}>
          {text("skipToMainContent", "Skip to Main Content")}
        </span>
        <span>|</span>
        <span onClick={setSmallFont}>A-</span>
        <span className="black-box" onClick={enableHighContrast}>A</span>
        <span onClick={setLargeFont}>A+</span>
        <span className="pink-box" onClick={disableHighContrast}>A</span>
        <span className="outline-box" onClick={setNormalFont}>A</span>
      </div>

      <div className="axis-prime-header">
        <div className="axis-header-brand">
          <img
            src="https://www.axis.bank.in/assets/images/logo-white.png"
            alt="Axis Bank"
          />
        </div>

        <div className="open-text">
          <span className="open-word">open</span>
          <span className="divider">|</span>
          <span className="internet-text">PRIME</span>
        </div>

        <div className="axis-prime-actions">
          <select
            className="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="mr">मराठी</option>
            <option value="bn">বাংলা</option>
            <option value="te">తెలుగు</option>
            <option value="ta">தமிழ்</option>
            <option value="gu">ગુજરાતી</option>
            <option value="kn">ಕನ್ನಡ</option>
            <option value="or">ଓଡ଼ିଆ</option>
          </select>

          <input placeholder={text("searchHere", "Search here..")} />
          <button onClick={logout}>{text("logout", "Logout")}</button>
        </div>
      </div>

      <div className="dashboard-container">
        <div className="sidebar">
          <ul>
            <li className={activeSection === "DASHBOARD" ? "active-menu" : ""} onClick={() => setActiveSection("DASHBOARD")}>
              🏠 {text("dashboard", "Dashboard")}
            </li>

            <li className={activeSection === "ACCOUNTS" ? "active-menu" : ""} onClick={() => setActiveSection("ACCOUNTS")}>
              💳 {text("accounts", "Accounts")}
            </li>

            <li className={activeSection === "FD" ? "active-menu" : ""} onClick={() => setActiveSection("FD")}>
              🏦 {text("fixedDeposit", "Fixed Deposit")}
            </li>

            <li className={activeSection === "MY_FD" ? "active-menu" : ""} onClick={() => setActiveSection("MY_FD")}>
              💰 My Deposits
            </li>

            <li className={activeSection === "RD" ? "active-menu" : ""} onClick={() => setActiveSection("RD")}>
              📈 {text("recurringDeposit", "Recurring Deposit")}
            </li>

            <li
  className={activeSection === "MY_RD" ? "active-menu" : ""}
  onClick={() => setActiveSection("MY_RD")}
>
  💰 My RD
</li>

            <li className={activeSection === "FUND_TRANSFER" ? "active-menu" : ""} onClick={() => setActiveSection("FUND_TRANSFER")}>
              💸 {text("fundTransfer", "Fund Transfer")}
            </li>

            <li className={activeSection === "TRANSACTIONS" ? "active-menu" : ""} onClick={() => setActiveSection("TRANSACTIONS")}>
              📄 {text("transactions", "Transactions")}
            </li>

            <li className={activeSection === "PROFILE" ? "active-menu" : ""} onClick={() => setActiveSection("PROFILE")}>
              👤 {text("profile", "Profile")}
            </li>

            <li onClick={logout}>🚪 {text("logout", "Logout")}</li>
          </ul>
        </div>

        <div className="main-content" ref={mainRef}>
          <div className="axis-welcome-row">
            <h2>Hi,{upper(getCustomerName(), "CUSTOMER")}</h2>

            <div className="axis-last-login">
              <strong>{upper(getCustomerName(), "CUSTOMER")}</strong>
              <span></span>
              <p>{text("lastLoggedIn", "Last logged in")}: {formatISTDateTime(new Date())}</p>
            </div>
          </div>

          {activeSection !== "DASHBOARD" && (
            <div className="breadcrumb-row">
              <span onClick={() => setActiveSection("DASHBOARD")}>
                {text("backToDashboard", "Back to Dashboard")}
              </span>
              <b>/</b>
              <span>{getSectionTitle()}</span>
            </div>
          )}
          {activeSection === "DASHBOARD" && (
            <>
              <div className="cards">
                <div className="card">
                  <h3>{text("customerIdOnly", "Customer ID")}</h3>
                  <p>{customer.customerId}</p>
                </div>

                <div className="card">
                  <h3>{text("accountNumber", "Account Number")}</h3>
                  <p>{account?.accountNumber || "-"}</p>
                </div>

                <div className="card balance-card">
                  <h3>{text("availableBalance", "Available Balance")}</h3>
                  <h2>₹ {formatCurrency(account?.balance)}</h2>
                </div>

                 <div className="card">
    <h3>Active Fixed Deposits</h3>
    <p>{activeFds.length}</p>
  </div>

  <div className="card">
    <h3>Active Recurring Deposits</h3>
    <p>{activeRds.length}</p>
  </div>
              </div>
             
              <div className="axis-product-row axis-product-row-modern">
  <div className="axis-product-card product-accounts">
    <h3>🏦 ACCOUNTS</h3>
    <div className="product-icon">🏛️</div>
    <p>Total Account Balance</p>
    <h2>₹ {account?.balance || 0}</h2>

    <div className="product-bottom">
      <span>Savings Account</span>
      <b>{account?.accountNumber || "-"}</b>
    </div>

    <button onClick={() => setActiveSection("ACCOUNTS")}>
      VIEW ACCOUNTS →
    </button>
  </div>

  <div className="axis-product-card product-fd">
    <h3>FIXED DEPOSIT</h3>
    <div className="product-icon">🏦</div>
    <p>Total FD Investment</p>
    <h2>₹ {totalFdInvestment}</h2>

    <div className="product-bottom">
      <span>Maturity Value</span>
      <b>₹ {totalFdMaturity}</b>
      <span>Active FD Accounts</span>
      <b>{activeFds.length}</b>
    </div>

    <button onClick={() => setActiveSection("FD")}>
      BOOK FD
    </button>
  </div>

  <div className="axis-product-card product-rd">
    <h3>RECURRING DEPOSIT</h3>
    <div className="product-icon">📈</div>
    <p>Total RD Investment</p>
    <h2>₹ {totalRdInvestment}</h2>

    <div className="product-bottom">
      <span>Maturity Value</span>
      <b>₹ {totalRdMaturity}</b>
      <span>Active RD Accounts</span>
      <b>{activeRds.length}</b>
    </div>

    <button onClick={() => setActiveSection("RD")}>
      OPEN RD
    </button>
  </div>

  <div className="axis-product-card product-credit">
    <h3>CREDIT CARDS</h3>
    <div className="product-icon">💳</div>
    <p>Total Limit Utilized</p>
    <h2>₹ ******</h2>

    <div className="product-bottom">
      <span>Total Credit Limit</span>
      <b>₹ ******</b>
      <span>Active Cards</span>
      <b>0</b>
    </div>

    <button>MANAGE CARDS</button>
  </div>

  <div className="axis-product-card product-demat">
    <h3>DEMAT</h3>
    <div className="product-icon">💹</div>
    <p>Total Value of Holding</p>
    <h2>₹ ******</h2>

    <div className="product-bottom">
      <span>Total Investment</span>
      <b>₹ ******</b>
      <span>Active Demat Accounts</span>
      <b>0</b>
    </div>

    <button>VIEW DEMAT</button>
  </div>
</div>
              <div className="quick-services">
                <div className="service-card" onClick={() => setActiveSection("FUND_TRANSFER")}>
                  💸 {text("fundTransfer", "Fund Transfer")}
                </div>

                <div className="service-card" onClick={() => setActiveSection("TRANSACTIONS")}>
                  📄 {text("viewTransactions", "View Transactions")}
                </div>

                <div className="service-card" onClick={() => setActiveSection("ACCOUNTS")}>
                  💳 {text("accountDetails", "Account Details")}
                </div>
              </div>

              <div className="dashboard-widget-grid">
                <div className="dashboard-widget">
                  <h3>{text("payNow", "Pay Now")}</h3>
                  <div className="empty-payee">👤</div>
                  <h4>{text("noPayeeAdded", "No Payee Added")}</h4>
                  <p>{text("payeeText", "You haven’t added any payee. Add a payee and start transacting today.")}</p>
                  <button onClick={() => setActiveSection("FUND_TRANSFER")}>
                    {text("addPayee", "ADD PAYEE")}
                  </button>
                </div>

                <div className="dashboard-widget">
                  <h3>{text("justForYou", "Just For You")}</h3>
                  <div className="offer-box">
                    <p>{text("offerText", "Get your Axis Bank RuPay Neo Credit Card instantly and earn rewards.")}</p>
                    <button>{text("availNow", "AVAIL NOW")}</button>
                  </div>
                </div>
              </div>

              <div className="dashboard-widget">
                <h3>{text("recommendedForYou", "Recommended For You")}</h3>
                <div className="recommend-row">
                  <div>💹 {text("recommendOne", "Get tax-free returns up to 4.16%")}</div>
                  <div>🧾 {text("recommendTwo", "Open PPF and save taxes")}</div>
                  <div>🎁 {text("recommendThree", "Redeem EDGE rewards")}</div>
                </div>
              </div>

              <div className="dashboard-widget-grid">
                <div className="dashboard-widget">
                  <h3>{text("recentTransactions", "Recent Transactions")}</h3>

                  {transactions.length === 0 && (
                    <p>{text("noTransactions", "No transactions available")}</p>
                  )}

                  {transactions.slice(0, 3).map((txn) => (
                    <div className="txn-mini" key={txn.id}>
                      <span>{formatISTDateTime(txn.transactionDate).split(",")[0]}</span>
                      <p>{txn.description}</p>
                      <b>{txn.transactionType === "CREDIT" ? "+" : "-"} ₹{txn.amount}</b>
                    </div>
                  ))}

                  <button onClick={() => setActiveSection("TRANSACTIONS")}>
                    {text("viewAll", "VIEW ALL")}
                  </button>
                </div>

                <div className="dashboard-widget">
                  <h3>{text("quickLinks", "Quick Links")}</h3>

                  <div className="quick-link-grid">
                    <div onClick={() => setActiveSection("ACCOUNTS")}>🏦<span>{text("accounts", "Accounts")}</span></div>
                    <div onClick={() => setActiveSection("FUND_TRANSFER")}>💸<span>{text("fundTransfer", "Fund Transfer")}</span></div>
                    <div onClick={() => setActiveSection("FD")}>💰<span>FD/RD</span></div>
                    <div>🛠<span>{text("services", "Services")}</span></div>
                    <div>🏦<span>{text("loans", "Loans")}</span></div>
                    <div>💳<span>{text("payCreditCardBill", "Pay Credit Card Bill")}</span></div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeSection === "ACCOUNTS" && (
            <div className="transaction-section">
              <h3>{text("accountInformation", "Account Information")}</h3>

              <div className="info-grid">
                <p><strong>{text("customerIdOnly", "Customer ID")}:</strong> {customer.customerId}</p>
                <p><strong>{text("accountNumber", "Account Number")}:</strong> {account?.accountNumber || "-"}</p>
                <p><strong>{text("accountType", "Account Type")}:</strong> {account?.accountType || "-"}</p>
                <p><strong>{text("availableBalance", "Available Balance")}:</strong> ₹ {account?.balance || 0}</p>
                <p><strong>{text("branch", "Branch")}:</strong> {account?.branchName || "Pune Main Branch"}</p>
                <p><strong>IFSC:</strong> {account?.ifscCode || "UTIB0000001"}</p>
              </div>
            </div>
          )}

          {activeSection === "FD" && (
            <div className="transaction-section">
              <h3>Open Fixed Deposit</h3>
              <p className="section-note">
                Book your FD instantly with Axis-like interest rates.
              </p>

              <div className="info-grid">
                <p><strong>Savings Account:</strong> {account?.accountNumber || "-"}</p>
                <p><strong>Available Balance:</strong> ₹ {account?.balance || 0}</p>
              </div>

              <div className="fund-transfer-form" style={{ marginTop: "25px" }}>
                <div className="form-row">
                  <label>Deposit Amount</label>
                  <input
                    type="number"
                    placeholder="Minimum ₹5000"
                    value={fdData.principalAmount}
                    onChange={(e) =>
                      setFdData({
                        ...fdData,
                        principalAmount: e.target.value
                      })
                      
                    }
                  />
                </div>
                

                <div className="form-row">
                  <label>Tenure</label>
                  <select
                    value={fdData.tenureDays}
                    onChange={(e) =>
                      setFdData({
                        ...fdData,
                        tenureDays: Number(e.target.value)
                      })
                    }
                  >
                    <option value="7">7 Days - 3.00%</option>
                    <option value="45">45 Days - 3.00%</option>
                    <option value="60">60 Days - 4.25%</option>
                    <option value="90">90 Days - 4.50%</option>
                    <option value="180">180 Days - 4.75%</option>
                    <option value="270">270 Days - 5.50%</option>
                    <option value="364">364 Days - 5.75%</option>
                    <option value="365">1 Year - 6.25%</option>
                    <option value="730">2 Years - 6.45%</option>
                    <option value="1095">3 Years - 6.45%</option>
                    <option value="1825">5 Years - 6.45%</option>
                  </select>
                </div>

                <div className="form-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={fdData.seniorCitizen}
                      onChange={(e) =>
                        setFdData({
                          ...fdData,
                          seniorCitizen: e.target.checked
                        })
                      }
                      style={{ width: "auto", marginRight: "10px" }}
                    />
                    Senior Citizen (+0.50%)
                  </label>
                </div>

                <div className="info-grid">
                  <p><strong>Interest Rate:</strong> {getFdRate(Number(fdData.tenureDays), fdData.seniorCitizen)}%</p>
                  <p><strong>Maturity Amount:</strong> ₹ {Number(calculateFdMaturity()).toLocaleString("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})}</p>
                  <p><strong>Maturity Date:</strong> {calculateFdMaturityDate()}</p>
                  <p><strong>Status:</strong> ACTIVE</p>
                </div>

                <button
                  className="primary-btn"
                  style={{ marginTop: "20px" }}
                  onClick={openFixedDeposit}
                >
                  Open Fixed Deposit
                </button>
              </div>
            </div>
          )}
           {activeSection === "RD" && (
  <div className="transaction-section">
    <h3>Open Recurring Deposit</h3>

    <p className="section-note">
      Open RD with monthly auto-debit from your savings account.
    </p>

    <div className="info-grid">
      <p>
        <strong>Savings Account:</strong> {account?.accountNumber || "-"}
      </p>

      <p>
        <strong>Available Balance:</strong> ₹ {account?.balance || 0}
      </p>
    </div>

    <div className="fund-transfer-form" style={{ marginTop: "25px" }}>
      <div className="form-row">
        <label>Monthly Installment</label>
        <input
          type="number"
          placeholder="Minimum ₹500"
          value={rdData.monthlyInstallment}
          onChange={(e) =>
            setRdData({
              ...rdData,
              monthlyInstallment: e.target.value
            })
          }
        />
      </div>

      <div className="form-row">
        <label>Tenure</label>
        <select
          value={rdData.tenureMonths}
          onChange={(e) =>
            setRdData({
              ...rdData,
              tenureMonths: Number(e.target.value)
            })
          }
        >
          <option value="12">12 Months</option>
          <option value="24">24 Months</option>
          <option value="36">36 Months</option>
          <option value="60">60 Months</option>
        </select>
      </div>

      <div className="form-row">
        <label>
          <input
            type="checkbox"
            checked={rdData.seniorCitizen}
            onChange={(e) =>
              setRdData({
                ...rdData,
                seniorCitizen: e.target.checked
              })
            }
            style={{ width: "auto", marginRight: "10px" }}
          />
          Senior Citizen (+0.50%)
        </label>
      </div>
      <div className="info-grid">
  <p>
    <strong>Interest Rate:</strong>{" "}
    {getRdRate(Number(rdData.tenureMonths), rdData.seniorCitizen)}%
  </p>

  <p>
    <strong>Total Investment:</strong> ₹{" "}
    {Number(rdData.monthlyInstallment || 0) *
      Number(rdData.tenureMonths || 0)}
  </p>

  <p>
    <strong>Maturity Amount:</strong> ₹ {Number(calculateRdMaturity()).toLocaleString("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})}
  </p>

  <p>
    <strong>Maturity Date:</strong> {calculateRdMaturityDate()}
  </p>
</div>

      <button
        className="primary-btn"
        style={{ marginTop: "20px" }}
        onClick={openRecurringDeposit}
      >
        Open Recurring Deposit
      </button>
    </div>
  </div>
)}
          {activeSection === "MY_FD" && (
            <div className="transaction-section">
              <h3>My Fixed Deposits</h3>

              <table>
                <thead>
                  <tr>
                    <th>FD Number</th>
                    <th>Principal</th>
                    <th>Rate</th>
                    <th>Tenure</th>
                    <th>Maturity Amount</th>
                    <th>Maturity Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {fixedDeposits.length === 0 && (
                    <tr>
                      <td colSpan="8">No fixed deposits available</td>
                    </tr>
                  )}

                  {fixedDeposits.map((fd) => (
                    <tr key={fd.id}>
                      <td>{fd.fdAccountNumber}</td>
                      <td>₹ {fd.principalAmount}</td>
                      <td>{fd.interestRate}%</td>
                      <td>{fd.tenureDays} days</td>
                      <td>₹ {fd.maturityAmount}</td>
                      <td>{fd.maturityDate}</td>
                      <td>
                        <span className={fd.status === "ACTIVE" ? "credit" : "debit"}>
                          {fd.status}
                        </span>
                      </td>
                    <td>
  <button
    className="primary-btn"
    onClick={() => downloadFdReceipt(fd.fdAccountNumber)}
  >
    Download Receipt
  </button>

  {fd.status === "ACTIVE" && (
    <button
      className="primary-btn"
      style={{ marginLeft: "10px" }}
            onClick={() => openFdCloseModal(fd.fdAccountNumber)}

    >
      Close FD
    </button>
  )}
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
                    )}

          {activeSection === "MY_RD" && (
  <div className="transaction-section">
    <h3>My Recurring Deposits</h3>

    <table>
      <thead>
        <tr>
          <th>RD Number</th>
          <th>Monthly<br />Installment</th>

          <th>Rate</th>
          <th>Tenure</th>
          <th>Paid</th>
          <th>Maturity<br />Amount</th>
          <th>Next<br />Installment</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {recurringDeposits.length === 0 && (
          <tr>
            <td colSpan="9">No recurring deposits available</td>
          </tr>
        )}

        {recurringDeposits.map((rd) => (
          <tr key={rd.id}>
            <td>{rd.rdAccountNumber}</td>
            <td>₹ {rd.monthlyInstallment}</td>
            <td>{rd.interestRate}%</td>
            <td>{rd.tenureMonths} months</td>
            <td>{rd.paidInstallments}</td>
            <td>₹ {rd.maturityAmount}</td>
            <td>{rd.nextInstallmentDate}</td>
            <td>
              <span className={rd.status === "ACTIVE" ? "credit" : "debit"}>
                {rd.status}
              </span>
            </td>
     <td>
  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
    <button
      className="primary-btn"
      onClick={() => downloadRdReceipt(rd.rdAccountNumber)}
    >
      Download Receipt
    </button>

    {rd.status === "ACTIVE" && (
      <button
        className="primary-btn"
        onClick={() => openRdCloseModal(rd.rdAccountNumber)}
      >
        Close RD
      </button>
    )}
  </div>
</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

          {activeSection === "FUND_TRANSFER" && (
            <div className="transaction-section">
              <h3>{text("fundTransfer", "Fund Transfer")}</h3>
              <p className="section-note">
                {text("fundTransferNote", "Transfer money securely to another Axis Bank account.")}
              </p>

              <div className="fund-transfer-form">
                <div className="form-row">
                  <label>{text("fromAccount", "From Account")}</label>
                  <input value={account?.accountNumber || ""} disabled />
                </div>

                <div className="form-row">
                  <label>{text("beneficiaryAccountNumber", "Beneficiary Account Number")}</label>
                  <input
                    placeholder={text("enterBeneficiaryAccount", "Enter beneficiary account number")}
                    value={transferData.toAccount}
                    onChange={(e) =>
                      setTransferData({
                        ...transferData,
                        toAccount: e.target.value
                      })
                    }
                  />
                </div>

                <div className="form-row">
                  <label>{text("amount", "Amount")}</label>
                  <input
                    type="number"
                    placeholder={text("enterAmount", "Enter amount")}
                    value={transferData.amount}
                    onChange={(e) =>
                      setTransferData({
                        ...transferData,
                        amount: e.target.value
                      })
                    }
                  />
                </div>

                <div className="form-row">
                  <label>{text("remarks", "Remarks")}</label>
                  <input
                    placeholder={text("enterRemarks", "Enter remarks")}
                    value={transferData.remarks}
                    onChange={(e) =>
                      setTransferData({
                        ...transferData,
                        remarks: e.target.value
                      })
                    }
                  />
                </div>

                <button className="primary-btn" onClick={handleFundTransfer}>
                  {text("transferNow", "Transfer Now")}
                </button>
              </div>
            </div>
          )}

          {activeSection === "TRANSACTIONS" && (
            <div className="transaction-section">
              <h3>{text("transactions", "Transactions")}</h3>

              <table>
                <thead>
                  <tr>
                    <th>{text("transactionId", "Transaction ID")}</th>
                    <th>{text("type", "Type")}</th>
                    <th>{text("amount", "Amount")}</th>
                    <th>{text("description", "Description")}</th>
                    <th>{text("dateTimeIst", "Date & Time IST")}</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan="5">{text("noTransactions", "No transactions available")}</td>
                    </tr>
                  )}

                  {transactions.map((txn) => (
                    <tr key={txn.id}>
                      <td>{txn.transactionId}</td>
                      <td>
                        <span className={txn.transactionType === "CREDIT" ? "credit" : "debit"}>
                          {txn.transactionType}
                        </span>
                      </td>
                      <td>{txn.transactionType === "CREDIT" ? "+" : "-"} ₹{txn.amount}</td>
                      <td>{txn.description}</td>
                      <td>{formatISTDateTime(txn.transactionDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* {activeSection === "RD" && (
            <div className="transaction-section">
              <h3>{text("recurringDeposit", "Recurring Deposit")}</h3>
              <p className="section-note">
                {text("rdNote", "Recurring Deposit feature will be implemented after FD.")}
              </p>
            </div>
          )} */}

          {activeSection === "PROFILE" && (
            <div className="transaction-section">
              <h3>{text("profile", "Profile")}</h3>

              <div className="info-grid">
                <p><strong>{text("name", "Name")}:</strong> {getCustomerName()}</p>
                <p><strong>{text("customerIdOnly", "Customer ID")}:</strong> {customer.customerId}</p>
                <p><strong>Email:</strong> {customer.email || "-"}</p>
                <p><strong>{text("mobile", "Mobile")}:</strong> {customer.mobileNumber || "-"}</p>
                <p><strong>PAN:</strong> {customer.panNumber || "-"}</p>
                <p><strong>Aadhaar:</strong> {customer.aadhaarNumber || "-"}</p>
              </div>
            </div>
          )}

          {fdToClose && (
          <div className="modal-overlay">
          <div className="fd-close-modal">
          <h2>Fixed Deposit Closure</h2>

      <p><strong>FD Account Number:</strong> {fdToClose.fdAccountNumber}</p>
      <p><strong>Principal Amount:</strong> ₹{fdToClose.principalAmount}</p>
      <p><strong>Interest Rate:</strong> {fdToClose.interestRate}%</p>
      <p><strong>Maturity Amount:</strong> ₹{fdToClose.maturityAmount}</p>

      <div className="warning-box">
        <p>This is a premature closure.</p>
        <p>Penalty Rate: 1%</p>
        <p>Closure amount will be calculated by system.</p>
      </div>

      <div className="modal-actions">
        <button
          className="secondary-btn"
          onClick={() => setFdToClose(null)}
        >
          Cancel
        </button>

        <button
          className="primary-btn"
          onClick={confirmCloseFixedDeposit}
        >
          Close FD
        </button>
      </div>
    </div>
  </div>
)}

{rdToClose && (
  <div className="modal-overlay">
    <div className="fd-close-modal">
      <h2>Recurring Deposit Closure</h2>

      <p><strong>RD Number:</strong> {rdToClose.rdAccountNumber}</p>
      <p><strong>Monthly Installment:</strong> ₹ {rdToClose.monthlyInstallment}</p>
      <p><strong>Interest Rate:</strong> {rdToClose.interestRate}%</p>
      <p><strong>Maturity Amount:</strong> ₹ {rdToClose.maturityAmount}</p>

      <div className="warning-box">
        <p>This is a premature closure.</p>
        <p>Penalty Rate: 1%</p>
        <p>Closure amount will be calculated by system.</p>
      </div>

      <div className="modal-actions">
        <button
          className="secondary-btn"
          onClick={() => setRdToClose(null)}
        >
          Cancel
        </button>

        <button
          className="primary-btn"
          onClick={confirmCloseRecurringDeposit}
        >
          Close RD
        </button>
      </div>
    </div>
  </div>
)}

          <div className="dashboard-footer">
            Copyright © 2019 Axis Bank, India | Disclaimer | Privacy policy |
            Best View | 🔒 Secured Login
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;