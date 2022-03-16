import React, {useState, useEffect} from "react";
import { render } from "react-dom";
import { minter2 } from "../../declarations/minter2";
import { Principal } from "@dfinity/principal";
import "../assets/main.css";
import { AuthClient } from "@dfinity/auth-client";
import { BrowserRouter, Route, Routes} from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<MinterX/>} />
      </Routes>
    </BrowserRouter>
  );
}

function Header(){
  return(
    <div>
    <center>
    <h2>Minter</h2>
    <img id="nft" src="logo.png" width={250} alt="bootcamp_logo" />
    </center>
    </div>
  )
}

function Footer (){
  return(
    <div>
    <hr/>
    <a href="https://bootcamp-faucet.vercel.app/">Bootcamp Faucet</a>
    </div>
  )
}

function MinterX () {

  const days = BigInt(1);
  const hours = BigInt(24);
  const nanoseconds = BigInt(3600000000000);

  var authClient;
  const [loginState, setLoginState] = useState(false);
  const [principal, setPrincipal] = useState("");
  const [tokenUris, setTokenUris] = useState(null);
  const [myTokenUris, setMyTokenUris] = useState(null);
  var uriLength = 0;

  async function getAllCollections() {
    let uris = await minter2.allCollections();
    setTokenUris(uris);
    if(uriLength){
      uriLength = uris.length;
    }
    else{
      uriLength = 0;
    }
    console.log("uris", uris);
  }
  async function getMyCollections() {
    let uris = await  minter2.myCollection();
    setMyTokenUris(uris);
    console.log("my uris", uris);
  }

  useEffect(async () => {
    authClient = await AuthClient.create();
    setLoginState(await authClient.isAuthenticated());
    console.log("auth state: ", loginState)
  });

  useEffect(async () => {
    let id = await authClient.getIdentity();
    setPrincipal(id.getPrincipal().toString());
    console.log("id", id._principal.toString());
  });

  useEffect(async () => {
    getAllCollections();
    getMyCollections();
  }, [uriLength]);

  async function login(){
      await authClient.login({
        onSuccess: async () => {
          setLoginState(true);
          console.log("auth state: ", loginState);
        },
        identityProvider:
          process.env.DFX_NETWORK === "ic"
            ? "https://identity.ic0.app/#authorize"
            : process.env.LOCAL_II_CANISTER,
        maxTimeToLive: days * hours * nanoseconds,
      });
  }

  async function logout(){
    await authClient.logout({
      onSuccess: async () => {
        setLoginState(false);
        console.log("auth state: ", loginState);
      },
      identityProvider:
        process.env.DFX_NETWORK === "ic"
          ? "https://identity.ic0.app/#authorize"
          : process.env.LOCAL_II_CANISTER
    });
  }

  async function mintNft(){
    const mintId = await minter2.mintAuto();
    console.log("The id is " + Number(mintId));
    getAllCollections();
    getMyCollections();
    // document.getElementById("nft").src = await minter2.tokenURI(mintId);
  }

  return (
    <div className="minter">
      <Header/>
      <div>
      <center>
        {loginState
          ?(<div>you can mint now</div>)
          :(<div>need login for mint <button onClick={()=> login()}>login</button></div>)
        }      
      </center>
      </div>
        <p/>
      <div>
      <center>
        <button onClick={()=> mintNft()}>Mint!</button>
      </center>
      </div>
      <p/><hr/>
      <div className="MyCollections">
        <h2>my collections</h2>
        {myTokenUris
          ? myTokenUris.map((val) =>  (<div key={val[0]}><img width="250" src={val[1]}/></div>))
          : (<div>no collections</div>)
        }
      </div>
      <p/><hr/>
      <div className="AllCollections">
        <h2>all collections</h2>
        {tokenUris
          ? tokenUris.map((val) => (<div key={val[0]}><img width="250" src={val[1]}/></div>))
          : (<div>no collections</div>)
        }
      </div>
      <p/>
      <hr/>
      <div>
      {loginState
          ?(<button onClick={()=> logout()}>logout</button>)
          :(<>...</>)
        }  
      </div>
      <p/>
      <Footer/>
    </div>
  );
};

document.title = "Minter2";
render(<App/>, document.getElementById("app"));