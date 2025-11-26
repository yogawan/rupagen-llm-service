// @/pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>RupaGen LLM Service</title>
        <link rel="icon" type="image/png" href="/favicon/icon.png" />
      </Head>
      <Component {...pageProps} />
    </>
  );
};

export default App;
