export function login(role) {
    localStorage.setItem('lynli_role', role);
    return role;
}

export function getRole() {
    return localStorage.getItem('lynli_role') || null;
}

export function logout() {
    localStorage.removeItem('lynli_role');
    window.location.reload();
}

export function checkPermission(action) {
    const role = getRole();
    if (action === 'ship' || action === 'settings') {
        return role === 'super';
    }
    return true;
}
