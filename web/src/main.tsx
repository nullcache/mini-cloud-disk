import ReactDOM from "react-dom/client";
import { App as AppContainer } from "antd";

import { HashRouter } from "react-router-dom";
import { ConfigProvider } from "antd";
import { theme } from "antd";
import locale from "antd/locale/zh_CN";
import App from "./App.tsx";
import "./index.css";

const themeConfig = {
  algorithm: [theme.darkAlgorithm],
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ConfigProvider locale={locale} theme={themeConfig}>
    <AppContainer>
      <HashRouter>
        <App />
      </HashRouter>
    </AppContainer>
  </ConfigProvider>
);
