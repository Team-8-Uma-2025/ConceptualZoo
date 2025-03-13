import './login.css';

function Login() {

    return(
        <html>
            <head> 
                <title>Login</title>
            </head>
            <body>
                <div class="login-container">
                    <h2>Login</h2>
                        <form action="/login" method="POST">
                            <label for="username">Username:</label>
                            <input type="text" id="username" name="username" required />

                            <label for="password">Password:</label>
                            <input type="password" id="password" name="password" required />

                            <button type="submit">Login</button>
                        </form>
                </div>
            </body>
        </html>
    );
}

export default Login;