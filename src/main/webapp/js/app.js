const config = {
    authority: 'https://test-maritimeid.maritimeconnectivity.net/auth/realms/MCP',
    client_id: 'validator',
    redirect_uri: window.location.origin + '/callback.html',
    response_type: 'code',
    scope: 'openid',
    automaticSilentRenew: true
};

const userManager = new Oidc.UserManager(config);

const loginButton = document.getElementById("login");
const logOutButton = document.getElementById("logout");
const validateButton = document.getElementById("validate");

let user = await userManager.getUser();

if (!user) {
    loginButton.addEventListener('click', () => userManager.signinRedirect());
    logOutButton.hidden = true;
    validateButton.hidden = true;
} else {
    logOutButton.addEventListener('click', () => {
        userManager.signoutRedirect({post_logout_redirect_uri: window.location.href});
    });
    loginButton.hidden = true;
    validateButton.addEventListener('click', async () => {
        user = await userManager.getUser();
        let response = await fetch('/api/validate', {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Authorization': 'Bearer ' + user.access_token
            }
        });
        const status = response.status;
        if (status === 200) {
            alert(await response.text());
        }
    });
}
