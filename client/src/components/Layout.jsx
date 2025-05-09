import { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children, user, handleTheme }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [children]);

  return (
    <div className="flex flex-col  min-h-screen">
      <Header handleTheme={handleTheme} user={user} />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;