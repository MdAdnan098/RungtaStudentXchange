import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ThemeProvider from "@/components/theme/ThemeProvider";
import ScrollToTop from "@/components/common/ScrollToTop";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import AppRoutes from "@/routes/AppRoutes";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            className: "toast",
            duration: 4000,
            style: {
              // react-hot-toast doesn't accept Tailwind classes for
              // background/color directly (it inlines its own style
              // attribute), so the theme tokens are read as CSS vars
              // here to stay in sync with light/dark mode.
              background: "rgb(var(--color-surface-raised))",
              color: "rgb(var(--color-text))",
              border: "1px solid rgb(var(--color-border))",
            },
            success: {
              iconTheme: {
                primary: "rgb(var(--color-success))",
                secondary: "rgb(var(--color-surface-raised))",
              },
            },
            error: {
              iconTheme: {
                primary: "rgb(var(--color-danger))",
                secondary: "rgb(var(--color-surface-raised))",
              },
            },
          }}
        />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
