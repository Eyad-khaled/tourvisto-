import './sycfusionLicense'

// import { registerLicense } from "@syncfusion/ej2-base";

// registerLicense(
//   "Ngo9BigBOggjHTQxAR8/V1JFaF1cXGtCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdmWH1fcnRcRGheVEF1XEtWYEg="
// );
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./contexts/appContext";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppProvider>
  </StrictMode>,
)
