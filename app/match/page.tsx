"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
import "@ant-design/v5-patch-for-react-19";
import { useRouter, /*useParams*/ } from "next/navigation";
import Image from "next/image";
import { Button /* , Row, Col, Space */ } from "antd";
// import { BookOutlined, CodeOutlined, GlobalOutlined } from "@ant-design/icons";
import styles from "@/styles/page.module.css";
// import { useApi } from "@/hooks/useApi";
// import { Match } from "@/types/match";
import { JSX, useState } from "react";

const MatchPage: React.FC = () => {

    const router = useRouter();
    // const apiService = useApi();

    const [cardsInHand, setCardsInHand] = useState<JSX.Element[]>([]);

    // let playerHand = document.getElementById("hand-0");



    return (

        <div className={`${styles.page} matchPage`}>
            <div className="gear-icon">
                <Image src = "/setting-gear.svg" alt="Settings" width={50} height={50} onClick={() => router.push("/settings")}/>
            </div>

        <div className="matchtester" draggable={true} style={{width: "100px", height: "100px", position: "absolute", top: "100px", left: "10px"}}>
            <Button
            onClick={() => setCardsInHand([...cardsInHand, <Image key="PLACEHOLDER" className="playingcard" src="https://deckofcardsapi.com/static/Image/AS.png" alt="PLACEHOLDER"></Image>])}>
                test
            </Button>
        </div>


        
        <div className="gameboard">

        <div className="score-table">
                <table>
                    <thead>
                    <tr>
                        <th>Player</th>
                        <th>Score</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>Player 1</td>
                        <td>10</td>
                    </tr>
                    <tr>
                        <td>Player 2</td>
                        <td>15</td>
                    </tr>
                    <tr>
                        <td>Player 3</td>
                        <td>20</td>
                    </tr>
                    <tr>
                        <td>Player 4</td>
                        <td>25</td>
                    </tr>
                    </tbody>
                </table>
        </div>

        <div className="hand-0">
            {cardsInHand}
        </div>    

        <div className="hand-1">
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
        </div>   

        <div className="hand-2">
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
        </div>   

        <div className="hand-3">
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
            <Image className="playingcard-back" src="https://deckofcardsapi.com/static/Image/back.png" alt="playingcard-back"></Image>
        </div>   

        <div className="pile">
            <Image className="playingcard-pile-0" src="https://deckofcardsapi.com/static/Image/AS.png" alt="PLACEHOLDER"></Image>
            <Image className="playingcard-pile-1" src="https://deckofcardsapi.com/static/Image/AS.png" alt="PLACEHOLDER"></Image>
            <Image className="playingcard-pile-2" src="https://deckofcardsapi.com/static/Image/AS.png" alt="PLACEHOLDER"></Image>
            <Image className="playingcard-pile-3" src="https://deckofcardsapi.com/static/Image/AS.png" alt="PLACEHOLDER"></Image>
        </div>

        <div className="game-playerscore0">
            <div className="game-avatarbox">
                <Image className="player-avatar" src="/avatars/actor-chaplin-comedy.png" alt="avatar"></Image>
            </div>
            <div className="game-playername">Player 1</div>
            <div className="game-playerscore">Score: 10</div>
            
       
        </div>

        <div className="game-playerscore1">
            <div className="game-avatarbox">
                <Image className="player-avatar" src="/avatars/addicted-draw-love.png" alt="avatar"></Image>
            </div>
            <div className="game-playername">Player 2</div>
            <div className="game-playerscore">Score: 15</div>
        </div>

        <div className="game-playerscore2">
            <div className="game-avatarbox">
                <Image className="player-avatar" src="/avatars/afro-avatar-male.png" alt="avatar"></Image>
            </div>
            <div className="game-playername">Player 3</div>
            <div className="game-playerscore">Score: 20</div>
        </div>

        <div className="game-playerscore3">
            <div className="game-avatarbox">
                <Image className="player-avatar" src="/avatars/alien-avatar-space.png" alt="avatar"></Image>
            </div>
            <div className="game-playername">Player 4</div>
            <div className="game-playerscore">Score: 25</div>
        </div>

        </div>
      </div>
       
    )

};

export default MatchPage;