import { ReactNode } from "react";
import { store } from "./store/store";
import { Provider } from "react-redux";

export function Providers(props: { children: ReactNode }) {
  return <Provider store={store}>{props.children}</Provider>;
}
