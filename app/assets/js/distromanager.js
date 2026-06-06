const { DistributionAPI } = require('helios-core/common')

const ConfigManager = require('./configmanager')

// URL do manifesto de distribuição do PixelPallet (GitHub Pages)
exports.REMOTE_DISTRO_URL = 'https://dexterlaboratorio.github.io/pixelpallet-distribution/distribution.json'

const api = new DistributionAPI(
    ConfigManager.getLauncherDirectory(),
    null, // Injected forcefully by the preloader.
    null, // Injected forcefully by the preloader.
    exports.REMOTE_DISTRO_URL,
    false
)

exports.DistroAPI = api