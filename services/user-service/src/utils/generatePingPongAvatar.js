
export const generatePingPongAvatar = (username) => {
    const initials = username.substring(0, 2).toUpperCase();
    const pingPongColors = ['ff6b35', '004d7a', '008744', 'ffa700', '73C8D2', '3A6F43', 'A8FBD3', '568F87', '333446']; // Orange, blue, green, yellow
    const randomColor = pingPongColors[Math.floor(Math.random() * pingPongColors.length)];

    return `https://ui-avatars.com/api/?name=${initials}&background=${randomColor}&color=fff&size=150&bold=true&font-size=0.6`;
}