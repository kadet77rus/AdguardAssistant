/**
 * This file is part of Adguard Browser Extension (https://github.com/AdguardTeam/AdguardBrowserExtension).
 *
 * Adguard Browser Extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Adguard Browser Extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Adguard Browser Extension.  If not, see <http://www.gnu.org/licenses/>.
 */
/* global chrome, $ */
(function () {

    'use strict';

    var browser = window.browser || chrome;
    var backgroundPage = browser.extension.getBackgroundPage();
    window.adguard = Object.create(backgroundPage.adguard);
    window.adguard.closePopup = function () {
        window.close();
    };
    window.adguard.resizePopup = function () {
    };

    window.i18n = browser.i18n;

    $(window).on('unload', function () {
        if (window.tab) {
            adguard.ui.updateTabIconAndContextMenu(window.tab, true);
        }
    });
})();