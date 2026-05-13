import React from "react";
import ReactDOM from "react-dom/client";
import { Activity, BadgeDollarSign, BarChart3, Clock, FileUp, Headphones, ShieldCheck, Table2, TrendingUp, Users } from "lucide-react";
import "./styles.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const initialForm = {
  tenure: 6,
  monthlyCharges: 89,
  totalCharges: 534,
  contract: "month-to-month",
  internetService: "fiber",
  paymentMethod: "electronic-check",
  techSupport: "no",
  onlineSecurity: "no",
  seniorCitizen: false,
  partner: false,
  dependents: false,
};

function App() {
  const [activePage, setActivePage] = React.useState("predict");
  const [form, setForm] = React.useState(initialForm);
  const [result, setResult] = React.useState(null);
  const [bulkRows, setBulkRows] = React.useState([]);
  const [bulkResult, setBulkResult] = React.useState(null);
  const [modelInfo, setModelInfo] = React.useState(null);
  const [history, setHistory] = React.useState([]);
  const [historyError, setHistoryError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [bulkLoading, setBulkLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [bulkError, setBulkError] = React.useState("");

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const loadHistory = React.useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/predictions?limit=50`);
      if (!response.ok) {
        throw new Error("History request failed");
      }
      const data = await response.json();
      setHistory(data.predictions || []);
      setHistoryError("");
    } catch (requestError) {
      setHistoryError("Prediction history is unavailable. Start the Flask backend to load analytics.");
    }
  }, []);

  React.useEffect(() => {
    fetch(`${API_BASE_URL}/api/model-info`)
      .then((response) => response.json())
      .then(setModelInfo)
      .catch(() => setModelInfo(null));

    loadHistory();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Prediction request failed");
      }

      setResult(await response.json());
      loadHistory();
    } catch (requestError) {
      setError("Could not reach the Flask API. Start the backend on port 5000 and try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadCsv = async (event) => {
    const file = event.target.files?.[0];
    setBulkResult(null);
    setBulkError("");

    if (!file) {
      setBulkRows([]);
      return;
    }

    try {
      const text = await file.text();
      setBulkRows(parseCsv(text));
    } catch (csvError) {
      setBulkRows([]);
      setBulkError("Could not read that CSV file.");
    }
  };

  const submitBulk = async () => {
    setBulkLoading(true);
    setBulkError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/predict-bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customers: bulkRows }),
      });

      if (!response.ok) {
        throw new Error("Bulk prediction request failed");
      }

      setBulkResult(await response.json());
      loadHistory();
    } catch (requestError) {
      setBulkError("Could not run bulk prediction. Check the CSV rows and make sure Flask is running.");
    } finally {
      setBulkLoading(false);
    }
  };

  const probability = result ? Math.round(result.probability * 100) : 0;
  const highRiskCount = bulkResult?.predictions.filter((prediction) => prediction.riskLevel === "High").length || 0;
  const analytics = buildAnalytics(history);
  const pages = [
    ["predict", "Prediction"],
    ["bulk", "Bulk Upload"],
    ["analytics", "Analytics"],
    ["model", "Model"],
  ];

  return (
    <main className="app-shell">
      <section className="app-header">
        <div>
          <p className="eyebrow">Retention analytics</p>
          <h1>Customer Churn Prediction</h1>
          <p className="intro">
            Score customer risk, understand churn drivers, and get targeted retention actions from a clean React and Flask workflow.
          </p>
        </div>
        <div className="metrics-grid" aria-label="Model highlights">
          <Metric icon={<Activity />} label="Signal mix" value="12 inputs" />
          <Metric icon={<TrendingUp />} label="Risk bands" value="Low-Med-High" />
          <Metric icon={<ShieldCheck />} label="Model status" value={modelInfo?.modelReady ? "ML ready" : "Fallback"} />
        </div>
      </section>

      <nav className="page-nav" aria-label="Application pages">
        {pages.map(([page, label]) => (
          <button
            key={page}
            className={activePage === page ? "active" : ""}
            type="button"
            onClick={() => setActivePage(page)}
          >
            {label}
          </button>
        ))}
      </nav>

      {activePage === "predict" && (
        <section className="page-panel workspace">
          <form className="panel form-panel" onSubmit={submit}>
            <div className="panel-heading">
              <h2>Customer Profile</h2>
              <button type="button" onClick={() => setForm(initialForm)}>Reset</button>
            </div>

            <div className="field-grid">
              <NumberField label="Tenure" suffix="months" value={form.tenure} onChange={(value) => updateField("tenure", value)} />
              <NumberField label="Monthly Charges" prefix="$" value={form.monthlyCharges} onChange={(value) => updateField("monthlyCharges", value)} />
              <NumberField label="Total Charges" prefix="$" value={form.totalCharges} onChange={(value) => updateField("totalCharges", value)} />
              <SelectField label="Contract" value={form.contract} onChange={(value) => updateField("contract", value)} options={[
                ["month-to-month", "Month-to-month"],
                ["one-year", "One year"],
                ["two-year", "Two year"],
              ]} />
              <SelectField label="Internet Service" value={form.internetService} onChange={(value) => updateField("internetService", value)} options={[
                ["fiber", "Fiber optic"],
                ["dsl", "DSL"],
                ["none", "None"],
              ]} />
              <SelectField label="Payment Method" value={form.paymentMethod} onChange={(value) => updateField("paymentMethod", value)} options={[
                ["electronic-check", "Electronic check"],
                ["credit-card", "Credit card"],
                ["bank-transfer", "Bank transfer"],
                ["mailed-check", "Mailed check"],
              ]} />
              <SelectField label="Tech Support" value={form.techSupport} onChange={(value) => updateField("techSupport", value)} options={[
                ["yes", "Yes"],
                ["no", "No"],
              ]} />
              <SelectField label="Online Security" value={form.onlineSecurity} onChange={(value) => updateField("onlineSecurity", value)} options={[
                ["yes", "Yes"],
                ["no", "No"],
              ]} />
            </div>

            <div className="toggle-row">
              <Toggle label="Senior Citizen" checked={form.seniorCitizen} onChange={(value) => updateField("seniorCitizen", value)} />
              <Toggle label="Partner" checked={form.partner} onChange={(value) => updateField("partner", value)} />
              <Toggle label="Dependents" checked={form.dependents} onChange={(value) => updateField("dependents", value)} />
            </div>

            <button className="primary-action" type="submit" disabled={loading}>
              {loading ? "Predicting..." : "Predict Churn"}
            </button>
            {error && <p className="error-message">{error}</p>}
          </form>

          <aside className="panel result-panel">
            <div className="panel-heading">
              <h2>Prediction</h2>
              <span className={result ? `risk-pill ${result.riskLevel.toLowerCase()}` : "risk-pill"}>{result?.riskLevel || "Waiting"}</span>
            </div>

            <div className="gauge" style={{ "--score": `${probability}%` }}>
              <div>
                <strong>{result ? `${probability}%` : "--"}</strong>
                <span>churn probability</span>
              </div>
            </div>

            <div className="insight-list">
              <Insight icon={<BadgeDollarSign />} title="Pricing sensitivity" text="High monthly charges can increase churn pressure." />
              <Insight icon={<Headphones />} title="Support coverage" text="Support and security bundles often improve retention." />
            </div>

            {result && (
              <div className="recommendations">
                <h3>Retention Actions</h3>
                {result.recommendations.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            )}
          </aside>
        </section>
      )}

      {activePage === "bulk" && (
        <section className="page-panel bulk-section panel">
          <div className="panel-heading">
            <div>
              <h2>Bulk Prediction</h2>
              <p className="section-note">Upload a CSV with the same columns as the sample dataset to score many customers together.</p>
            </div>
            <span className="bulk-count">{bulkRows.length} rows loaded</span>
          </div>

          <div className="bulk-grid">
            <label className="upload-zone">
              <FileUp />
              <span>Choose CSV file</span>
              <input type="file" accept=".csv,text/csv" onChange={loadCsv} />
            </label>

            <div className="bulk-summary">
              <Metric icon={<Table2 />} label="Ready to score" value={`${bulkRows.length} customers`} />
              <Metric icon={<TrendingUp />} label="High risk found" value={`${highRiskCount} customers`} />
            </div>
          </div>

          <button className="primary-action bulk-action" type="button" onClick={submitBulk} disabled={!bulkRows.length || bulkLoading}>
            {bulkLoading ? "Predicting CSV..." : "Predict All Customers"}
          </button>
          {bulkError && <p className="error-message">{bulkError}</p>}

          {bulkResult && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Customer</th>
                    <th>Contract</th>
                    <th>Monthly</th>
                    <th>Probability</th>
                    <th>Risk</th>
                    <th>Churn</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkResult.predictions.map((prediction) => (
                    <tr key={prediction.id}>
                      <td>{prediction.row}</td>
                      <td>{prediction.customer.customer_id || prediction.customer.customerId || `Saved #${prediction.id}`}</td>
                      <td>{formatValue(prediction.customer.contract)}</td>
                      <td>${Number(prediction.customer.monthlyCharges || 0).toFixed(2)}</td>
                      <td>{Math.round(prediction.probability * 100)}%</td>
                      <td><span className={`risk-pill ${prediction.riskLevel.toLowerCase()}`}>{prediction.riskLevel}</span></td>
                      <td>{prediction.churn ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activePage === "analytics" && (
        <section className="page-panel analytics-section panel">
          <div className="panel-heading">
            <div>
              <h2>Prediction History Dashboard</h2>
              <p className="section-note">Track saved predictions, risk concentration, churn split, and recent customer scores.</p>
            </div>
            <button type="button" onClick={loadHistory}>Refresh</button>
          </div>

          {historyError && <p className="error-message">{historyError}</p>}

          <div className="analytics-grid">
            <Metric icon={<Users />} label="Saved predictions" value={analytics.total} />
            <Metric icon={<TrendingUp />} label="Average risk" value={`${analytics.averageProbability}%`} />
            <Metric icon={<BarChart3 />} label="High risk" value={analytics.riskCounts.High} />
            <Metric icon={<Clock />} label="Latest record" value={analytics.latestDate} />
          </div>

          <div className="chart-grid">
            <ChartPanel title="Risk Distribution">
              <RiskBar label="High" value={analytics.riskCounts.High} total={analytics.total} className="high-bar" />
              <RiskBar label="Medium" value={analytics.riskCounts.Medium} total={analytics.total} className="medium-bar" />
              <RiskBar label="Low" value={analytics.riskCounts.Low} total={analytics.total} className="low-bar" />
            </ChartPanel>

            <ChartPanel title="Churn Split">
              <div className="split-chart">
                <div className="split-segment churn">
                  <strong>{analytics.churnRate}%</strong>
                  <span>Likely churn</span>
                </div>
                <div className="split-segment retained">
                  <strong>{100 - analytics.churnRate}%</strong>
                  <span>Likely retained</span>
                </div>
              </div>
            </ChartPanel>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Contract</th>
                  <th>Monthly</th>
                  <th>Probability</th>
                  <th>Risk</th>
                  <th>Churn</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {history.length ? history.map((prediction) => (
                  <tr key={prediction.id}>
                    <td>#{prediction.id}</td>
                    <td>{prediction.customer.customer_id || prediction.customer.customerId || "Manual entry"}</td>
                    <td>{formatValue(prediction.customer.contract)}</td>
                    <td>${Number(prediction.customer.monthlyCharges || 0).toFixed(2)}</td>
                    <td>{Math.round(prediction.probability * 100)}%</td>
                    <td><span className={`risk-pill ${prediction.riskLevel.toLowerCase()}`}>{prediction.riskLevel}</span></td>
                    <td>{prediction.churn ? "Yes" : "No"}</td>
                    <td>{formatDate(prediction.createdAt)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="8">No prediction history yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activePage === "model" && (
        <section className="page-panel model-strip panel">
          <div>
            <p className="eyebrow">Model performance</p>
            <h2>{modelInfo?.modelName || "Checking model..."}</h2>
            <p className="section-note">This page shows the trained ML model status and evaluation metrics used for the final-year demo.</p>
          </div>
          <pre>{modelInfo?.metrics || "Start the Flask backend to load model metrics."}</pre>
        </section>
      )}
    </main>
  );
}

function buildAnalytics(history) {
  const total = history.length;
  const riskCounts = { High: 0, Medium: 0, Low: 0 };
  const probabilityTotal = history.reduce((sum, prediction) => {
    riskCounts[prediction.riskLevel] = (riskCounts[prediction.riskLevel] || 0) + 1;
    return sum + Number(prediction.probability || 0);
  }, 0);
  const churnCount = history.filter((prediction) => prediction.churn).length;

  return {
    total,
    riskCounts,
    averageProbability: total ? Math.round((probabilityTotal / total) * 100) : 0,
    churnRate: total ? Math.round((churnCount / total) * 100) : 0,
    latestDate: history[0]?.createdAt ? formatDate(history[0].createdAt) : "-",
  };
}

function RiskBar({ label, value, total, className }) {
  const percentage = total ? Math.round((value / total) * 100) : 0;

  return (
    <div className="risk-row">
      <div>
        <strong>{label}</strong>
        <span>{value} customers</span>
      </div>
      <div className="bar-track">
        <span className={className} style={{ width: `${percentage}%` }} />
      </div>
      <b>{percentage}%</b>
    </div>
  );
}

function ChartPanel({ title, children }) {
  return (
    <div className="chart-panel">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) {
    return [];
  }

  const headers = splitCsvLine(lines[0]).map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    return headers.reduce((row, header, index) => {
      const normalizedHeader = normalizeHeader(header);
      row[normalizedHeader] = normalizeValue(values[index] || "", normalizedHeader);
      return row;
    }, {});
  });
}

function splitCsvLine(line) {
  return line.split(",").map((value) => value.trim().replace(/^"|"$/g, ""));
}

function normalizeHeader(header) {
  const knownHeaders = {
    customer_id: "customer_id",
    customerId: "customerId",
    tenure: "tenure",
    monthlyCharges: "monthlyCharges",
    totalCharges: "totalCharges",
    contract: "contract",
    internetService: "internetService",
    paymentMethod: "paymentMethod",
    techSupport: "techSupport",
    onlineSecurity: "onlineSecurity",
    seniorCitizen: "seniorCitizen",
    partner: "partner",
    dependents: "dependents",
  };

  return knownHeaders[header] || header;
}

function normalizeValue(value, header) {
  const lowerValue = value.toLowerCase();

  if (["seniorCitizen", "partner", "dependents"].includes(header)) {
    if (lowerValue === "true" || lowerValue === "yes" || lowerValue === "1") {
      return true;
    }
    if (lowerValue === "false" || lowerValue === "no" || lowerValue === "0") {
      return false;
    }
  }

  if (value !== "" && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return value;
}

function formatValue(value) {
  return String(value || "-").replaceAll("-", " ");
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value.replace(" ", "T")).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Metric({ icon, label, value }) {
  return (
    <div className="metric">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function NumberField({ label, value, onChange, prefix = "", suffix = "" }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="input-shell">
        {prefix && <b>{prefix}</b>}
        <input type="number" min="0" value={value} onChange={(event) => onChange(Number(event.target.value))} />
        {suffix && <b>{suffix}</b>}
      </div>
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>{optionLabel}</option>
        ))}
      </select>
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function Insight({ icon, title, text }) {
  return (
    <div className="insight">
      {icon}
      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
