const config = {
    authority: 'https://test-maritimeid.maritimeconnectivity.net/auth/realms/MCP',
    client_id: 'validator',
    redirect_uri: 'http://localhost:8080/callback.html',
    response_type: 'code',
    scope: 'openid'
};

let userManager = new Oidc.UserManager(config);

let loginButton = document.getElementById("login");
loginButton.addEventListener('click', () => userManager.signinRedirect());

let logOutButton = document.getElementById("logout");
logOutButton.addEventListener('click', () => userManager.signoutRedirect({post_logout_redirect_uri: window.location.href}));
