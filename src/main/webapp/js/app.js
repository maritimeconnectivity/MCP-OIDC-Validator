const mrnPattern = /^urn:mrn:([a-z0-9]([a-z0-9]|-){0,20}[a-z0-9]):([a-z0-9][-a-z0-9]{0,20}[a-z0-9]):((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)|\/)*)((\?\+((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)|\/|\?)*))?(\?=((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)|\/|\?)*))?)?(#(((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)|\/|\?)*))?$/i;
const mcpMrnPattern = /^urn:mrn:mcp:(device|org|user|vessel|service|mms|mir|msr):([a-z0-9]([a-z0-9]|-){0,20}[a-z0-9]):((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)|\/)*)$/i;
const greenCheckMark = "\u2705";
const redCheckMark = "\u274C";

const oidcEndpointResponse = await fetch('/config/endpoint');
let oidcEndpoint;
if (oidcEndpointResponse.status === 200) {
    oidcEndpoint = await oidcEndpointResponse.text();
} else {
    alert("The OIDC endpoint could not be fetched");
}

const config = {
    authority: oidcEndpoint,
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
    "permissions", "subsidiary_mrn", "mms_url", "url"];

const validators = {
    uid: isValidUid,
    mrn: isValidMcpMrn,
    ship_mrn: isValidMcpMrn,
    subsidiary_mrn: isValidMrn,
    mms_url: isValidUrl,
    url: isValidUrl
}

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
            headers: {
                'Authorization': 'Bearer ' + user.access_token
            }
        });
        if (response.status === 200) {
            alert(await response.text());
        } else {
            alert("Access token is not valid");
        }
        const idToken = user.id_token;
        const idTokenSplit = idToken.split('.');
        const id = JSON.parse(atob(idTokenSplit[1]));
        claims.forEach(claim => {
            const claimValue = id[claim];
            const tableRow = document.getElementById(claim);
            if (claimValue) {
                tableRow.cells[1].textContent = claimValue;
                if (validators[claim]) {
                    tableRow.cells[2].textContent = (validators[claim](claimValue) ? greenCheckMark : redCheckMark);
                }
            }
        });
    });
}

function isValidUid(uid) {
    return true;
}

function isValidMrn(mrn) {
    return mrnPattern.test(mrn);
}

function isValidMcpMrn(mrn) {
    return mrnPattern.test(mrn) && mcpMrnPattern.test(mrn);
}

function isValidUrl(url) {
    try {
        new URL(url);
    } catch (e) {
        return false;
    }
    return true;
}
