import { Suspense, memo } from "react";
import "./App.css";
import { useRoutes } from "react-router";
import routes from "@/router/index";

const App = memo(() => <Suspense fallback="">{useRoutes(routes)}</Suspense>);

export default App;
