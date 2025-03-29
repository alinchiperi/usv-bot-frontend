import {BotIcon} from "lucide-react";
import React from "react";
import '../styles/LoadingIndicator.css';
const LoadingIndicator = () => {
    return (
        <div className="flex py-4 px-4 bg-white">
            <div className="mr-4">
                <BotIcon />
            </div>
            <div className="flex-1">
                <div className="loading-dots">
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                </div>
            </div>
        </div>
    );
};


export default LoadingIndicator;