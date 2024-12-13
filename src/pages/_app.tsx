import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { ToastContainer } from "react-toastify";
import { RecoilRoot } from "recoil";
import 'react-toastify/dist/ReactToastify.css';
import { Provider } from "react-redux";
import { store } from "@/state/store";


export default function App({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <Provider store={store}>
        <Head>
          <title>LeetClone</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon1.png" />
          <meta
            name="description"
            content="Web application that contains leetcode problems and video solutions"
          />
        </Head>
        <ToastContainer />
        <Component {...pageProps} />
      </Provider>
    </RecoilRoot>
  );
}
