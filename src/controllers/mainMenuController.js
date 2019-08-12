import { reloadPageBypassCache } from '../utils/common-utils';

/**
 * Main menu controller
 * @param $
 * @param wot
 * @param localization
 * @param gmApi
 * @returns {{init: init}}
 * @constructor
 */
/* global Ioc, StringUtils */
export default function DetailedMenuController(
    $,
    wot,
    localization,
    gmApi,
    settings,
    log,
    protectedApi,
) {
    let contentDocument = null;
    let iframeCtrl = null;
    let domain = null;
    const FILTERING_STATE_LS_PROPERTY = '__adfstate';

    const setDomain = () => {
        domain = decodeURIComponent(window.location.hostname);
        contentDocument.getElementsByClassName('menu-head_name')[0].textContent = domain || 'unknown';
    };

    const truncateDecimals = number => Math[number < 0 ? 'ceil' : 'floor'](number);

    const getWotReputationSettings = (wotData) => {
        if (!wotData) {
            return null;
        }
        const prefix = 'adg-wot-';
        const averageWot = wotData.reputation;
        let wotRatingText = null;
        let wotRating = null;
        if (averageWot === 0) {
            wotRatingText = localization.getMessage('wot_unknown_description');
            wotRating = `${prefix}unknown`;
            return {
                text: wotRatingText,
                class: wotRating,
            };
        }
        const wotSettings = {
            0: {
                color: 'red',
                string: localization.getMessage('wot_bad_description'),
            },
            1: {
                color: 'lightRed',
                string: localization.getMessage('wot_poor_description'),
            },
            2: {
                color: 'yellow',
                string: localization.getMessage('wot_unsatisfactory_description'),
            },
            3: {
                color: 'lightGreen',
                string: localization.getMessage('wot_good_description'),
            },
            4: {
                color: 'green',
                string: localization.getMessage('wot_excellent_description'),
            },
            5: {
                color: 'green',
                string: localization.getMessage('wot_excellent_description'),
            },
        };
        const current = wotSettings[truncateDecimals(averageWot / 20)];
        wotRatingText = current.string;
        wotRating = prefix + current.color;
        return {
            text: wotRatingText,
            class: wotRating,
        };
    };

    const getWotConfidenceClass = (wotData) => {
        if (!wotData) {
            return null;
        }
        const prefix = 'adg-wot-confidence-';
        const confidenceWot = wotData.confidence;
        if (confidenceWot >= 0 && confidenceWot < 6) {
            return `${prefix}0`;
        }
        if (confidenceWot >= 6 && confidenceWot < 12) {
            return `${prefix}1`;
        }
        if (confidenceWot >= 12 && confidenceWot < 23) {
            return `${prefix}2`;
        }
        if (confidenceWot >= 23 && confidenceWot < 34) {
            return `${prefix}3`;
        }
        if (confidenceWot >= 34 && confidenceWot < 45) {
            return `${prefix}4`;
        }
        if (confidenceWot >= 45) {
            return `${prefix}5`;
        }
        return undefined;
    };

    const setWotData = () => {
        const wotData = wot.getWotData();
        const wotReputationSettings = getWotReputationSettings(wotData);

        if (wotReputationSettings) {
            const wotIndication = $(contentDocument.getElementById('WotIndication'));
            const wotDescriptionText = contentDocument.getElementById('WotDescriptionText');
            const confidenceIndication = $(contentDocument.getElementById('ConfidenceIndication'));

            contentDocument.getElementsByClassName('wot-indicator')[0].href = wot.getWotScorecardUrl(domain);
            wotIndication.addClass(wotReputationSettings.class);
            const wotLogo = '<span id="WotLogo"><span class="wot-logo"></span></span>';
            wotDescriptionText.innerHTML = wotReputationSettings.text.replace('$1', wotLogo);

            const wotConfidenceClass = getWotConfidenceClass(wotData);
            confidenceIndication.addClass(wotConfidenceClass);

            $(contentDocument.getElementsByClassName('wot-hide')).removeClass('wot-hide');
        }
    };

    const startAdSelector = () => {
        iframeCtrl.showSelectorMenu();
    };

    const goToWotUrl = () => {
        window.open(wot.WOT_URL, '_blank');
    };

    const doNotBlock = () => {
        gmApi.ADG_temporaryDontBlock(30, () => {
            reloadPageBypassCache();
        });
    };

    const reportAbuse = () => {
        gmApi.ADG_sendAbuse(() => {
            iframeCtrl.removeIframe();
        });
    };

    const goToSiteReport = () => {
        const url = StringUtils.format(settings.Constants.REPORT_URL, domain);
        window.open(url, '_blank');
    };

    const showHideBlockAdButton = (isFilter) => {
        if (isFilter) {
            $(contentDocument.getElementById('block-ad')).removeClass('hidden');
        } else {
            $(contentDocument.getElementById('block-ad')).addClass('hidden');
        }

        iframeCtrl.resizeIframe();
    };

    /**
     * Storing the filtering state for quick initialization
     *
     * @param {Boolean} state  on/off filtering state
     */
    // eslint-disable-next-line consistent-return
    const setFilteringStateToStore = (state) => {
        try {
            localStorage.setItem(
                FILTERING_STATE_LS_PROPERTY,
                protectedApi.json.stringify({ state }),
            );
        } catch (ex) {
            log.error(ex);
            return null;
        }
    };

    const onIsFilterChange = () => {
        const isFilter = contentDocument.getElementById('is-filter').checked;

        // animate class for prevent animation while the state from the application is determined
        $(contentDocument.querySelectorAll('.menu-filter_label')).addClass('animate');

        showHideBlockAdButton(isFilter);
        setFilteringStateToStore(isFilter);
        gmApi.ADG_changeFilteringState(isFilter, () => {
            reloadPageBypassCache();
        });
    };

    const bindEvents = () => {
        const menuEvents = {
            '.close': iframeCtrl.removeIframe,
            '#block-ad': startAdSelector,
            '#assistant-settings': iframeCtrl.showSettingsMenu,
            '#WotLogo': goToWotUrl,
            '#do-not-block-30-sec': doNotBlock,
            '#report-abuse': reportAbuse,
            '#site-report': goToSiteReport,
            '#is-filter': onIsFilterChange,
        };
        Object.keys(menuEvents).forEach((item) => {
            $(contentDocument.querySelectorAll(item)).on('click', menuEvents[item]);
        });
    };

    /**
     * Getting the filtering state for quick initialization from the localStorage,
     * while the state from the application is determined
     *
     * @returns {Boolean} on/off filtering state
     */
    const getFilteringStateFromStore = () => {
        try {
            const state = localStorage.getItem(FILTERING_STATE_LS_PROPERTY);
            if (state) {
                return protectedApi.json.parse(state).state;
            }
            return false;
        } catch (ex) {
            log.error(ex);
            return false;
        }
    };

    const setInitFilteringState = () => {
        const input = contentDocument.getElementById('is-filter');
        input.checked = getFilteringStateFromStore();
        gmApi.ADG_isFiltered((isFiltered) => {
            input.checked = isFiltered;
            setFilteringStateToStore(isFiltered);
            showHideBlockAdButton(isFiltered);
        });
    };

    /*
     Called from IframeController._showMenuItem to initialize view
     */
    const init = (iframe) => {
        // eslint-disable-next-line prefer-destructuring
        contentDocument = iframe.contentDocument;
        iframeCtrl = Ioc.get('iframeController');
        setDomain();
        setWotData();
        bindEvents();
        setInitFilteringState();
    };

    return { init };
}
