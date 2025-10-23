import { createContext, useContext, useState } from "react";

const TestContext = createContext();

export const TestProvider = ({ children }) => {
  const [activeTest, setActiveTest] = useState(null);
  const [progress, setProgress] = useState(null);
  return (
    <TestContext.Provider value={{ activeTest, setActiveTest, progress, setProgress }}>
      {children}
    </TestContext.Provider>
  );
};

export const useTest = () => useContext(TestContext);
