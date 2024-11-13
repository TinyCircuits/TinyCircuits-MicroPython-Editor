import './App.css'
import './tailwind_output.css'
import { Theme, Dropdown } from 'react-daisyui'
import { useState, useEffect } from 'react';


function AccountIcon(props){

    const {user, className} = props;                    // Passed properties
    const [loggedIn, setLoggedIn] = useState(false);    // Used to track logged in state to refresh the UI when the tab is refocused


    // Returns a generic user icon if logged in, otherwise, a question mark
    const renderIcon = () => {
        if(user.loggedIn()){
            return(
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-person-fill" viewBox="0 0 16 16">
                    <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
                </svg>
            );
        }else{
            return(
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-question" viewBox="0 0 16 16">
                    <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94"/>
                </svg>
            );
        }
    }


    // Render the dropdown items depending on if logged in or not
    const renderDropdownItems = () => {
        if(user.loggedIn()){
            return(
                <>
                    <Dropdown.Item onClick={() => {gotoAccount()}}>Account</Dropdown.Item>
                    <Dropdown.Item onClick={() => {logout()}}>Logout</Dropdown.Item>
                </>
            )
        }else{
            return(
                <>
                    <Dropdown.Item onClick={() => {login()}}>Login</Dropdown.Item>
                </>
            )
        }
    }


    // Open account page in new tab
    const gotoAccount = () => {
        console.log("Go to account");
        window.open(window.location.origin + "/account/", "_blank");
    }


    // Open login page in new tab
    const login = () => {
        console.log("Login");
        window.open(window.location.origin + "/login/", "_blank");
    }


    // Logout the user
    const logout = () => {
        console.log("Logout");
        user.logout();

        // Set that this component tracks the user as not logged in
        setLoggedIn(false);
    }


    // Only once register focus callback so that the login icon
    // can be changed when the tab is refocused
    useEffect(() => {
        // Set this for an initial value, once
        setLoggedIn(user.loggedIn());

        // When the tab is focused and the tracked logged in
        // state does not match the current logged actual state,
        // update the trakcer therefore updating the UI
        window.addEventListener('focus', function() {
            if(loggedIn != user.loggedIn()){
                setLoggedIn(user.loggedIn());
            }
        });
    }, []);


    return(
        <Theme dataTheme="dim" className={className}>
            <Dropdown horizontal='left'>
                <Dropdown.Toggle className='h-8'>
                    {renderIcon()}
                </Dropdown.Toggle>

                <Dropdown.Menu className="w-40 z-[2000]">
                    {renderDropdownItems()}
                </Dropdown.Menu>
            </Dropdown>
        </Theme>
    );
}


export default AccountIcon;