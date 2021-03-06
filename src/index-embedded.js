import { adguardAssistantMini, adguardAssistantExtended } from './embedded';

const mobileReg = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i;

// eslint-disable-next-line func-names
(function (base) {
    if (mobileReg.test(navigator.userAgent)) {
        // eslint-disable-next-line no-param-reassign
        base.adguardAssistant = adguardAssistantMini;
    } else {
        // eslint-disable-next-line no-param-reassign
        base.adguardAssistant = adguardAssistantExtended;
    }
}(this || window));
