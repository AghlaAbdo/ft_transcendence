import React from 'react';

export default function LoadingPong() {
  return (
    <div className="flex items-center justify-center">
      <svg
        className="w-32 h-32"
        viewBox="0 0 128 128"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ball */}
        <g className="animate-ball-x">
          <circle className="animate-ball-y fill-pink" r="10" />
        </g>

        {/* Paddle */}
        <g className="animate-paddle-x">
          <rect
            className="animate-paddle-y fill-pink"
            x="-30"
            y="-2"
            rx="1"
            ry="1"
            width="60"
            height="4"
          />
        </g>
      </svg>
    </div>
  );
}
