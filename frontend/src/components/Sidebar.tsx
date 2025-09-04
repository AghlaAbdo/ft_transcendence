import Image from "next/image";
import logoIcon from "../../public/icons/logo.svg"
import homeIcon from "../../public/icons/home.svg"
import gameIcon from "../../public/icons/game.svg"
import chatIcon from "../../public/icons/chat.svg"
import settingsIcon from "../../public/icons/settings.svg"
import logoutIcon from "../../public/icons/logout.svg"

export default function Sidebar() {
    return (
        <div>
            <div>
                <Image src={logoIcon} alt="logo"/>
            </div>
            <div>
                <Image src={homeIcon} alt="Home"/>
                <Image src={gameIcon} alt="Play game" />
                <Image src={chatIcon} alt="Chat page" />
            </div>
            <div>
                <Image src={settingsIcon} alt="Settings" />
                <Image src={logoutIcon} alt="Logout" />
            </div>
        </div>
    );
}