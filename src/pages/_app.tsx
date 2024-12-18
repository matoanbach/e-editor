import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Provider } from "react-redux";
import { store } from "@/state/store";
import { Auth0Provider } from "@auth0/auth0-react"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN!}
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!}
      authorizationParams={{
        redirect_uri: process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URL
      }}
    >
      <Provider store={store}>
        <Head>
          <title>LeetYap</title>
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
    </Auth0Provider>
  );
}
