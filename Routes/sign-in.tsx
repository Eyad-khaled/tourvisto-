import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { Link, redirect, useNavigate } from "react-router-dom";
import { loginWithGoogle, getExistingUser, storeUserData } from "../app/appwrite/auth";
import { account } from "../app/appwrite/client";
import { useEffect } from "react";

export async function clientLoader() {
  try {
    console.log('Sign-in clientLoader: Checking for OAuth callback');

    // Check if we have an active session (OAuth callback)
    const sessions = await account.listSessions();
    const hasActiveSession = sessions?.sessions?.some(session => session.current);

    console.log('Sign-in clientLoader: Has active session?', hasActiveSession);
    console.log('Sign-in clientLoader: Sessions:', sessions);

    if (hasActiveSession) {
      console.log('Sign-in clientLoader: Processing OAuth callback');
      // We have a session, check if user exists in database
      const user = await account.get();
      console.log('Sign-in clientLoader: Authenticated user:', user);

      const existingUser = await getExistingUser(user.$id);
      console.log('Sign-in clientLoader: Existing user in DB:', existingUser);

      // If user exists in database, redirect to dashboard
      if (existingUser) {
        console.log('Sign-in clientLoader: Redirecting to dashboard (user exists)');
        return redirect("/dashboard");
      }

      // If user doesn't exist, create them first
      try {
        console.log('Sign-in clientLoader: Creating user in database');
        await storeUserData();
        console.log('Sign-in clientLoader: Redirecting to dashboard (user created)');
        return redirect("/dashboard");
      } catch (createError) {
        console.error("Error creating user:", createError);
        // Still redirect to dashboard even if user creation fails
        console.log('Sign-in clientLoader: Redirecting to dashboard (creation failed)');
        return redirect("/dashboard");
      }
    }

    console.log('Sign-in clientLoader: No active session, staying on sign-in page');
    // No active session, stay on sign-in page
    return null;
  } catch (e) {
    console.log('Error during client load', e);
    return null;
  }
}

const SignIn = () => {
  const navigate = useNavigate();

 useEffect(() => {
  const handleOAuthCallback = async () => {
    try {
      let session = null;
      for (let i = 0; i < 5; i++) { // retry 5 times
        session = await account.getSession("current").catch(() => null);
        if (session) break;
        await new Promise(r => setTimeout(r, 300));
      }

      if (!session) return; // no session yet

      const user = await account.get();
      const existingUser = await getExistingUser(user.$id);

      if (!existingUser) await storeUserData();

      // Navigate after session is ready
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("OAuth callback error:", error);
    }
  };

  handleOAuthCallback();
}, [navigate]);


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
        </div>
      </section>
    </main>
  );
};

export default SignIn;
