import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function DashboardPage() {

  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {

    const customerData =
      localStorage.getItem("customer");

    if (!customerData) {

      navigate("/");
      return;
    }

    const loggedInCustomer =
      JSON.parse(customerData);

    setCustomer(loggedInCustomer);

    fetch(
      `http://localhost:8084/account/${loggedInCustomer.customerId}`
    )
      .then(response => response.json())
      .then(accountData => {

        setAccount(accountData);

        return fetch(
          `http://localhost:8084/transaction/${accountData.accountNumber}`
        );
      })
      .then(response => response.json())
      .then(transactionData => {

        setTransactions(transactionData);
      })
      .catch(error => {

        console.log(error);
      });

  }, [navigate]);

  const logout = () => {

    localStorage.removeItem("customer");
    navigate("/");
  };

  if (!customer) {

    return null;
  }

  return (

    <div className="dashboard-container">

      <div className="sidebar">

        <div className="logo-section">

          <img
            src="https://www.axis.bank.in/assets/images/logo-white.png"
            alt="Axis Bank"
            className="axis-logo"
          />

        </div>

        <ul>

          <li>🏠 Dashboard</li>
          <li>💳 Accounts</li>
          <li>🏦 Fixed Deposit</li>
          <li>📈 Recurring Deposit</li>
          <li>💸 Fund Transfer</li>
          <li>📄 Transactions</li>
          <li>👤 Profile</li>

          <li
            onClick={logout}
            style={{ cursor: "pointer" }}
          >
            🚪 Logout
          </li>

        </ul>

      </div>

      <div className="main-content">

        <div className="top-navbar">

          <h2>
            Welcome {customer.fullName}
          </h2>

        </div>

        <div className="cards">

          <div className="card">

            <h3>Customer ID</h3>

            <p>
              {customer.customerId}
            </p>

          </div>

          <div className="card">

            <h3>Account Number</h3>

            <p>
              {account?.accountNumber}
            </p>

          </div>

          <div className="card">

            <h3>Available Balance</h3>

            <h2>
              ₹ {account?.balance}
            </h2>

          </div>

        </div>

        <div
          className="transaction-section"
          style={{ marginTop: "30px" }}
        >

          <h3>
            Account Information
          </h3>

          <br />

          <p>
            <strong>Account Type:</strong>
            {" "}
            {account?.accountType}
          </p>

          <br />

          <p>
            <strong>Branch:</strong>
            {" "}
            {account?.branchName}
          </p>

          <br />

          <p>
            <strong>IFSC:</strong>
            {" "}
            {account?.ifscCode}
          </p>

        </div>

        <div
          className="transaction-section"
          style={{ marginTop: "40px" }}
        >

          <h3>
            Recent Transactions
          </h3>

          <br />

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse"
            }}
          >

            <thead>

              <tr>

                <th>ID</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Description</th>

              </tr>

            </thead>

            <tbody>

              {
                transactions.map(txn => (

                  <tr
                    key={txn.id}
                  >

                    <td>
                      {txn.transactionId}
                    </td>

                    <td>
                      {txn.transactionType}
                    </td>

                    <td>

                      {
                        txn.transactionType === "CREDIT"
                          ? `+ ₹${txn.amount}`
                          : `- ₹${txn.amount}`
                      }

                    </td>

                    <td>
                      {txn.description}
                    </td>

                  </tr>

                ))
              }

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default DashboardPage;