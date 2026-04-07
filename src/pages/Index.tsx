import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    window.location.href = "/landing.html";
  }, []);

  return null;
};

export default Index;
