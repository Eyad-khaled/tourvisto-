//ts-nocheck
import { account } from '../app/appwrite/client';
import { getExistingUser, storeUserData } from '../app/appwrite/auth';
import { SidebarComponent } from "@syncfusion/ej2-react-navigations";
import type { SidebarComponent as SidebarRef } from "@syncfusion/ej2-react-navigations";
import { Link ,useLocation , useNavigate } from "react-router-dom";
import type { ComponentType } from "react";
import NavItems from "./NavItems";
import { useEffect } from 'react';

const MobileBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  async function clientLoader(){
    try{
      const user = await account.get();
      if (!user) {return navigate("/sign-in")}
      if (user && location.pathname === "/sign-in") {
        return navigate("/");
      }
      const existingUser = await getExistingUser();
      //  console.log('existingUser in clientLoader', existingUser?.status);
      if(existingUser?.status === "user"){  
        return navigate("/")
      }
      
      //  console.log('user',user);
      
      
      return existingUser?.$id ? existingUser : await storeUserData()
    }catch(e){
      
      console.log('Error in client loader' , e);
      return navigate("/sign-in");
    }
  }

  let sidebar: SidebarRef | null = null;
  const handleClick = () => {
    sidebar?.hide();
  };
  useEffect(()=>{
    clientLoader()
  } , [])
  const SidebarAny = SidebarComponent as unknown as ComponentType<any>;

  return (
    <div className="mobile-sidebar wrapper">
      <header>
        <Link to="/">
          <img
            src="/assets/icons/logo.svg"
            alt="Logo"
            className="size-[30px]"
          />
          <h1>Tourvisto</h1>
        </Link>

        <button
          onClick={() => {
            sidebar?.toggle();
          }}
          className="cursor-pointer"
        >
          <img
            src="/assets/icons/menu.svg"
            alt="Menu"
            className="size-6"
          />
        </button>
      </header>

      <SidebarAny
        style = {{width:'270px'}}
        
        ref={(Sidebar: SidebarRef | null) => { sidebar = Sidebar; }}
        closeOnDocumentClick={true}
        showBackdrop={true}
        type="over"
      >
        <NavItems handleClick={handleClick} />
      </SidebarAny>
    </div>
  );
};

export default MobileBar;
