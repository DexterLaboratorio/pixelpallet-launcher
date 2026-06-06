/**
 * Script for login.ejs — PixelPallet offline auth
 * Jogador digita apenas um nick (sem senha, sem conta Mojang/Microsoft).
 */
const validUsername   = /^[a-zA-Z0-9_]{3,16}$/

const loginCancelContainer = document.getElementById('loginCancelContainer')
const loginCancelButton    = document.getElementById('loginCancelButton')
const loginEmailError      = document.getElementById('loginEmailError')
const loginUsername        = document.getElementById('loginUsername')
const loginButton          = document.getElementById('loginButton')
const loginForm            = document.getElementById('loginForm')

// ─── Helpers ──────────────────────────────────────────────────────────────────

function showError(element, value) {
    element.innerHTML = value
    element.style.opacity = 1
}

function clearError(element) {
    element.innerHTML = ''
    element.style.opacity = 0
}

function loginDisabled(v) {
    if (loginButton.disabled !== v) {
        loginButton.disabled = v
    }
}

function loginLoading(v) {
    if (v) {
        loginButton.setAttribute('loading', v)
    } else {
        loginButton.removeAttribute('loading')
    }
}

function formDisabled(v) {
    loginDisabled(v)
    loginUsername.disabled = v
    if (loginCancelButton) loginCancelButton.disabled = v
}

// ─── Validação do nick ─────────────────────────────────────────────────────────

function validateUsername(value) {
    if (!value) {
        showError(loginEmailError, 'Digite um nick.')
        loginDisabled(true)
        return false
    }
    if (!validUsername.test(value)) {
        showError(loginEmailError, 'Nick inválido. Use 3-16 letras, números ou underline.')
        loginDisabled(true)
        return false
    }
    clearError(loginEmailError)
    loginDisabled(false)
    return true
}

loginUsername.addEventListener('input', (e) => {
    validateUsername(e.target.value)
})

loginUsername.addEventListener('focusout', (e) => {
    validateUsername(e.target.value)
})

// ─── Botão cancelar ───────────────────────────────────────────────────────────

let loginViewOnSuccess = VIEWS.landing
let loginViewOnCancel  = VIEWS.settings
let loginViewCancelHandler

function loginCancelEnabled(val) {
    if (val) {
        $(loginCancelContainer).show()
    } else {
        $(loginCancelContainer).hide()
    }
}

if (loginCancelButton) {
    loginCancelButton.onclick = () => {
        switchView(getCurrentView(), loginViewOnCancel, 500, 500, () => {
            loginUsername.value = ''
            clearError(loginEmailError)
            loginDisabled(true)
            loginCancelEnabled(false)
            if (loginViewCancelHandler != null) {
                loginViewCancelHandler()
                loginViewCancelHandler = null
            }
        })
    }
}

loginForm.onsubmit = () => false

// ─── Clique em JOGAR ──────────────────────────────────────────────────────────

loginButton.addEventListener('click', () => {
    const username = loginUsername.value.trim()

    if (!validateUsername(username)) return

    formDisabled(true)
    loginLoading(true)

    try {
        // Cria conta offline — sem chamada de rede, sem senha
        const account = AuthManager.addOfflineAccount(username)

        updateSelectedAccount(account)

        // Animação de sucesso
        $('.circle-loader').toggleClass('load-complete')
        $('.checkmark').toggle()

        setTimeout(() => {
            switchView(VIEWS.login, loginViewOnSuccess, 500, 500, async () => {
                if (loginViewOnSuccess === VIEWS.settings) {
                    await prepareSettings()
                }
                // Reset para próxima vez
                loginViewOnSuccess = VIEWS.landing
                loginCancelEnabled(false)
                loginViewCancelHandler = null
                loginUsername.value = ''
                clearError(loginEmailError)
                loginDisabled(true)
                $('.circle-loader').toggleClass('load-complete')
                $('.checkmark').toggle()
                loginLoading(false)
                formDisabled(false)
            })
        }, 1000)

    } catch (err) {
        console.error('Erro ao criar conta offline:', err)
        loginLoading(false)
        formDisabled(false)
        setOverlayContent(
            'Erro inesperado',
            'Não foi possível criar a conta offline. Tente novamente.',
            'Tentar novamente'
        )
        setOverlayHandler(() => toggleOverlay(false))
        toggleOverlay(true)
    }
})
