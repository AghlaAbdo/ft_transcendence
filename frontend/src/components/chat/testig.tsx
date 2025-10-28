import React from 'react';
import ReactDOM from 'react-dom';
function App() {
    const greeting = "Hello";
    return <h1>{greeting} World</h1>;
}
ReactDOM.render(<App />, document.getElementById('root'));