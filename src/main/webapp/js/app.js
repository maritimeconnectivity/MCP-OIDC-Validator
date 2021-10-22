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

const claims = ["uid", "flagstate", "callsign", "imo_number", "mmsi", "ais_type", "registered_port", "ship_mrn", "mrn",
    "permissions", "subsidiary_mrn", "mms_url", "mms_url"];

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
        const response = await fetch('/api/validate', {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Authorization': 'Bearer ' + user.access_token
            }
        });
        if (response.status === 200) {
            alert(await response.text());
        }
        const idToken = user.id_token;
        const idTokenSplit = idToken.split('.');
        const id = JSON.parse(atob(idTokenSplit[1]));
        claims.forEach(claim => {
           const claimValue = id[claim];
           if (claimValue) {
               const tableRow = document.getElementById(claim);
               tableRow.cells[1].textContent = claimValue;
               tableRow.cells[2].textContent = "\u2705";
           }
        });
    });
}
