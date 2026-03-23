document.addEventListener('DOMContentLoaded', () => {
    const toggleAuthBtn = document.getElementById('toggle-auth');
    const authTitle = document.getElementById('auth-title');
    const authForm = document.getElementById('auth-form');
    let isLogin = true;

    if (toggleAuthBtn) {
        toggleAuthBtn.addEventListener('click', (e) => {
            e.preventDefault();
            isLogin = !isLogin;
            if (isLogin) {
                authTitle.innerText = "私人放映室";
                toggleAuthBtn.innerText = "获取入场券";
                authForm.querySelector('button').innerText = "落 座";
            } else {
                authTitle.innerText = "访客名册登记";
                toggleAuthBtn.innerText = "返回放映室";
                authForm.querySelector('button').innerText = "签 署";
            }
        });
    }
});