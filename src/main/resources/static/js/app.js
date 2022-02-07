const mrnPattern = /^urn:mrn:([a-z0-9]([a-z0-9]|-){0,20}[a-z0-9]):([a-z0-9][-a-z0-9]{0,20}[a-z0-9]):((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)|\/)*)((\?\+((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)|\/|\?)*))?(\?=((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)|\/|\?)*))?)?(#(((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)|\/|\?)*))?$/i;
const mcpMrnPattern = /^urn:mrn:mcp:(device|org|user|vessel|service|mms|mir|msr):([a-z0-9]([a-z0-9]|-){0,20}[a-z0-9]):((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)((([-._a-z0-9]|~)|%[0-9a-f][0-9a-f]|([!$&'()*+,;=])|:|@)|\/)*)$/i;
const mmsiPattern = /^\d{9}$/;
const imoNumberPattern = /^(IMO)?( )?\d{7}$/;
const aisTypePattern = /^[AB]$/;
const greenCheckMark = "\u2705";
const redCheckMark = "\u274C";

const oidcEndpointResponse = await fetch('/config/endpoint');
let oidcEndpoint;
if (oidcEndpointResponse.status === 200) {
    oidcEndpoint = await oidcEndpointResponse.text();
} else {
    alert("The OIDC endpoint could not be fetched");
    throw new Error("The OIDC endpoint could not be fetched");
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
    flagstate: isValidFlagstate,
    callsign: isValidCallsign,
    imo_number: isValidImoNumber,
    mmsi: isValidMmsi,
    ais_type: isValidAisType,
    registered_port: isValidRegisteredPort,
    ship_mrn: isValidShipMrn,
    mrn: isValidPrimaryMrn,
    permissions: isValidPermissions,
    subsidiary_mrn: isValidSubsidiaryMrn,
    mms_url: isValidUrl,
    url: isValidUrl
}

let user = await userManager.getUser();
let type;
let uidRdn;

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
        const id = JSON.parse(b64DecodeUnicode(idTokenSplit[1]));
        claims.forEach(claim => {
            const claimValue = id[claim];
            const tableRow = document.getElementById(claim);
            if (claimValue)
                tableRow.cells[1].textContent = claimValue;
            if (validators[claim]) {
                tableRow.cells[2].textContent = validators[claim](claimValue);
            }
        });
    });
}

function isValidUid(uid) {
    const uidSplit = uid.replace("\\,", "\\.").split(",").map(rdn => rdn.replace("\\.", "\\,").trim());
    const rdnMap = uidSplit.reduce((o, rdn) => {
        const split = rdn.split("=");
        o[split[0].toUpperCase()] = split[1];
        return o;
    }, {});

    type = rdnMap.OU.toLowerCase();
    if (!type)
        return redCheckMark;

    uidRdn = rdnMap.UID;
    if (!uidRdn || !isValidMcpMrn(uidRdn))
        return redCheckMark;

    const orgMrn = rdnMap.O;
    if (!isValidMcpMrn(orgMrn))
        return redCheckMark;

    const mrnSplit = uidRdn.split(":");
    const orgMrnSplit = orgMrn.split(":");
    if (mrnSplit[4] !== orgMrnSplit[4]) // Check that user mrn and the mrn of its org has the same IPSS
        return redCheckMark;

    const email = rdnMap.E;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) // if there is an email address we check that is valid
        return redCheckMark;

    return greenCheckMark;
}

function isValidFlagstate(flagstate) {
    if (["vessel", "service"].includes(type)) {
        return flagstate instanceof String ? greenCheckMark : redCheckMark;
    }
    return "";
}

function isValidCallsign(callsign) {
    if (["vessel", "service"].includes(type)) {
        return callsign instanceof String ? greenCheckMark : redCheckMark;
    }
    return "";
}

function isValidImoNumber(imoNumber) {
    if (["vessel", "service"].includes(type)) {
        return imoNumberPattern.test(imoNumber) ? greenCheckMark : redCheckMark;
    }
    return "";
}

function isValidMmsi(mmsi) {
    if (["vessel", "service"].includes(type)) {
        return mmsiPattern.test(mmsi) ? greenCheckMark : redCheckMark;
    }
    return "";
}

function isValidAisType(aisType) {
    if (["vessel", "service"].includes(type)) {
        return (aisTypePattern.test(aisType)) ? greenCheckMark : redCheckMark;
    }
    return "";
}

function isValidRegisteredPort(registeredPort) {
    if (registeredPort && ["vessel", "service"].includes(type)) {
        return registeredPort instanceof String ? greenCheckMark : redCheckMark;
    }
    return "";
}

function isValidShipMrn(shipMrn) {
    if (shipMrn && ["vessel", "service"].includes(type)) {
        return shipMrn instanceof String ? greenCheckMark : redCheckMark;
    }
    return "";
}

function isValidMrn(mrn) {
    return (mrn instanceof String && mrnPattern.test(mrn)) ? greenCheckMark : redCheckMark;
}

function isValidPermissions(permissions) {
    if (permissions) {
        return (permissions instanceof String || permissions instanceof Array) ? greenCheckMark : redCheckMark;
    }
    return "";
}

function isValidSubsidiaryMrn(subsidiaryMrn) {
    if (subsidiaryMrn) {
        return isValidMrn(subsidiaryMrn);
    }
    return "";
}

function isValidMcpMrn(mrn) {
    return (mrnPattern.test(mrn) && mcpMrnPattern.test(mrn)) ? greenCheckMark : redCheckMark;
}

function isValidPrimaryMrn(mrn) {
    if (mrn === uidRdn) {
        return isValidMcpMrn(mrn);
    }
    return redCheckMark;
}

function isValidUrl(url) {
    if (url) {
        try {
            new URL(url);
        } catch (e) {
            return redCheckMark;
        }
        return greenCheckMark;
    }
    return "";
}

// Function taken from https://stackoverflow.com/a/30106551
function b64DecodeUnicode(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}
