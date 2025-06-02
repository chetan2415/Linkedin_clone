import "@/styles/globals.css";
import { Provider } from "react-redux";
import { store, persistor } from "@/config/redux/store";
import Head from "next/head";
import Layout from "@/components/Layout";
import { PersistGate } from "redux-persist/integration/react";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head />
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </PersistGate>
      </Provider>
    </>
  );
}
