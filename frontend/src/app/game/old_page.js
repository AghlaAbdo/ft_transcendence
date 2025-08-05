'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Home;
var react_1 = require("react");
var socket_1 = require("../socket");
var game_module_css_1 = require("./game.module.css");
function Home() {
    var _a = (0, react_1.useState)(''), message = _a[0], setMessage = _a[1];
    var refCanvas = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        socket_1.socket.connect();
        socket_1.socket.on('connect', function () {
            console.log('Connected to Socket.IO server!');
            console.log('Socket ID:', socket_1.socket.id);
        });
        socket_1.socket.on('messageee', function (msg) {
            setMessage(msg);
        });
        var canvas = refCanvas.current;
        if (canvas) {
            var ctx = canvas.getContext('2d');
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 50, 50, 200);
        }
        return function () {
            socket_1.socket.disconnect();
        };
    }, []);
    function handleSubmit(event) {
        event.preventDefault();
        socket_1.socket.emit("message", message);
        setMessage('');
    }
    return (<>
      <div className={game_module_css_1.default.container}>
        <canvas ref={refCanvas} width="900px" height="600px" className={game_module_css_1.default.canvas}></canvas>
      </div>
    </>);
}
