import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import useTheme from "./hooks/useTheme";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import JobListPage from "./pages/JobListPage";
import MyJobsList from "./pages/MyJobsList";
import JobDetailsPage from "./pages/JobDetailsPage";
import ApplicationForm from "./pages/candidates/ApplicationForm";
import NewJobForm from "./pages/companies/NewJobForm";
import EditJobForm from "./pages/companies/EditJobForm";
import Layout from "./components/Layout";
import Notification from "./components/Notification";
import Applicants from "./pages/companies/Applicants";

function App() {
  // eslint-disable-next-line no-unused-vars
  const [_theme, toggleTheme] = useTheme();
  const { user } = useAuth();

  return (
    <>
      <Notification />
      <Layout user={user} handleTheme={toggleTheme}>
        <Routes>
          {!user ? (
            <>
              <Route path="*" element={<Navigate to="/" />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/" element={<JobListPage />} />
              <Route path="/jobs/:id" element={<JobDetailsPage />} />
            </>
          ) : (
            <>
              <Route path="*" element={<Navigate to="/" />} />
              <Route path="/" element={<JobListPage />} />
              <Route path="/jobs/:id" element={<JobDetailsPage />} />
              <Route path="jobs/:id/apply" element={<ApplicationForm />} />
              <Route path="/myjobs" element={<MyJobsList />} />
              {user.role === "company" && (
                <>
                  <Route path="*" element={<Navigate to="/myjobs" />} />
                  <Route path="/jobs/:id/edit" element={<EditJobForm />} />
                  <Route path="/new" element={<NewJobForm />} />
                  <Route path="/myjobs/:id/applicants" element={<Applicants/>} />
                </>
              )}
            </>
          )}
        </Routes>
      </Layout>
    </>
  );
}

export default App;
