import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { Link, useNavigate } from "react-router-dom";
import { loginWithGoogle } from "../app/appwrite/auth";
import { useAppContext } from "@/contexts/appContext";
import { useEffect, useState } from "react";
import { account } from "../app/appwrite/client";



const SignIn = () => {

  const { user, loadingUser } = useAppContext();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loadingUser && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loadingUser, navigate]);
  const [diag, setDiag] = useState({ url: '', query: '', sessions: null as any, account: null as any, lastUpdated: '' });

  const fetchDiag = async () => {
    try {
      const url = window.location.href;
      const query = window.location.search + ' ' + window.location.hash;
      const sessions = await account.listSessions().catch((e) => ({ error: e?.message || e }));
      const acct = await account.get().catch((e) => ({ error: e?.message || e }));
      setDiag({ url, query, sessions, account: acct, lastUpdated: new Date().toISOString() });
    } catch (e) {
      setDiag((d) => ({ ...d, sessions: { error: String(e) }, lastUpdated: new Date().toISOString() }));
    }
  };

  useEffect(() => {
    fetchDiag();
    const interval = setInterval(fetchDiag, 2000);
    // stop polling after 20s
    const stop = setTimeout(() => { clearInterval(interval); }, 20000);
    return () => { clearInterval(interval); clearTimeout(stop); };
  }, []);
  return (
    <main className="auth">
      <section className="size-full glassmorphism flex-center px-6">
        <div className="sign-in-card">
          <header className="header">
            <Link to="/">
              <img
                src="/assets/icons/logo.svg"
                alt="logo"
                className="size-[30px]"
              />
            </Link>
            <h1 className="p-28-bold text-dark-100 ">TourVisto</h1>
          </header>
          <article>
            <h2 className="p-28-semibold text-dark-100 text-center">
              Start Your Travel Journey
            </h2>
            <p className="p-18-regular text-center text-gray-100 !leading-7">
              Sign In With Google To Manage Destinations , Itineraries , And
              User Activity With Ease
            </p>
          </article>
          <ButtonComponent
            iconCss="e-search-icon"
            type="button"
            onClick={loginWithGoogle}
            className="button-class !h-11 !w-full "
          >
            <img
              src="/assets/icons/google.svg"
              alt="google"
              className="size-5"
            />
            <span className="p-18-semibold text-white ">
              Sign In With Google
            </span>
          </ButtonComponent>
          <div style={{ marginTop: 12 }}>
            <button onClick={fetchDiag} className="p-12-semibold px-3 bg-gray-200 rounded">Refresh diagnostics</button>
            <div style={{ marginTop: 8, maxHeight: 220, overflow: 'auto', background: '#0b1220', color: '#dbeafe', padding: 8, borderRadius: 8, fontSize: 12 }}>
              <div><strong>URL:</strong> {diag.url}</div>
              <div><strong>Query/Hash:</strong> {diag.query}</div>
              <div><strong>Last:</strong> {diag.lastUpdated}</div>
              <hr style={{ borderColor: '#1f2937' }} />
              <div><strong>listSessions:</strong></div>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(diag.sessions, null, 2)}</pre>
              <div><strong>account.get:</strong></div>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(diag.account, null, 2)}</pre>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SignIn;
