(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.YoutubeExternalSubtitle = factory());
}(this, (function () { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    let __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (let s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (let p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    const Container = /** @class */ (function () {
        function Container() {
            this.window = null;
            this.document = null;
            this.YT = null;
            this.initService = null;
        }
        Container.prototype.setWindow = function (window) {
            this.window = window;
        };
        Container.prototype.getWindow = function () {
            return this.window;
        };
        Container.prototype.setDocument = function (document) {
            this.document = document;
        };
        Container.prototype.getDocument = function () {
            return this.document;
        };
        Container.prototype.setYT = function (YT) {
            this.YT = YT;
        };
        Container.prototype.getYT = function () {
            return this.YT;
        };
        Container.prototype.setInitService = function (initService) {
            this.initService = initService;
        };
        Container.prototype.getInitService = function () {
            return this.initService;
        };
        return Container;
    }());
    const DIC = new Container();

    const CSS = {
        ID: 'youtube-external-subtitle-style',
        CLASS: 'youtube-external-subtitle',
        FULLSCREEN: 'fullscreen',
        FULLSCREEN_IGNORE: 'fullscreen-ignore'
    };
    const iframeApiScriptAdded = function (document) {
        const scripts = document.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
            const src = scripts[i].src;
            if (src && src.indexOf('youtube.com/iframe_api') !== -1) {
                return true;
            }
        }
        return false;
    };
    const addIframeApiScript = function (document) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    };
    const grantIframeApiScript = function (document) {
        if (!iframeApiScriptAdded(document)) {
            addIframeApiScript(document);
        }
    };
    const iframeApiLoaded = function (window) {
        return !!(window.YT && window.YT.Player);
    };
    const waitFor = function (isReady, onComplete) {
        if (isReady()) {
            onComplete();
            return;
        }
        const interval = setInterval(function () {
            if (isReady()) {
                clearInterval(interval);
                onComplete();
            }
        }, 100);
    };
    const getFullscreenElement = function (document) {
        return document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.webkitCurrentFullScreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement;
    };
    const getSubtitles = function (container) {
        const initService = DIC.getInitService();
        return initService.getSubtitles().filter(function (subtitle) { return subtitle.isInContainer(container); });
    };
    const getFullscreenSubtitle = function (fullscreenElement) {
        if (!fullscreenElement) {
            return null;
        }
        if (fullscreenElement.youtubeExternalSubtitle) {
            return fullscreenElement.youtubeExternalSubtitle;
        }
        const elements = getSubtitles(fullscreenElement);
        if (elements.length > 0) {
            return elements[0];
        }
        return null;
    };
    const fullscreenChangeHandler = function () {
        const document = DIC.getDocument();
        const fullscreenElement = getFullscreenElement(document);
        const isFullscreen = !!fullscreenElement;
        const fullscreenSubtitle = getFullscreenSubtitle(fullscreenElement);
        const subtitles = getSubtitles(document);
        for (let _i = 0, subtitles_1 = subtitles; _i < subtitles_1.length; _i++) {
            const subtitle = subtitles_1[_i];
            subtitle.setIsFullscreenActive(isFullscreen ? fullscreenSubtitle === subtitle : null);
        }
    };
    const globalStylesAdded = function (document) {
        return !!document.getElementById(CSS.ID);
    };
    const addGlobalStyles = function (document) {
        const style = document.createElement('style');
        style.id = CSS.ID;
        style.type = 'text/css';
        style.innerHTML = '\n    .' + CSS.CLASS + ' { position: absolute; display: none; z-index: 0; pointer-events: none; color: #fff; font-family: Arial, "Helvetica Neue", Helvetica, sans-serif; font-weight: normal; font-size: 17px; text-align: center; }\n    .' + CSS.CLASS + ' span { background: #000; background: rgba(0, 0, 0, 0.9); padding: 1px 4px; display: inline-block; margin-bottom: 2px; }\n    .' + CSS.CLASS + '.' + CSS.FULLSCREEN_IGNORE + ' { display: none !important; }\n    .' + CSS.CLASS + '.' + CSS.FULLSCREEN + ' { z-index: 3000000000; }\n  ';
        const head = document.getElementsByTagName('head')[0] || document.documentElement;
        head.insertBefore(style, head.firstChild);
        document.addEventListener('fullscreenchange', fullscreenChangeHandler);
        document.addEventListener('webkitfullscreenchange', fullscreenChangeHandler);
        document.addEventListener('mozfullscreenchange', fullscreenChangeHandler);
        document.addEventListener('MSFullscreenChange', fullscreenChangeHandler);
    };
    const InitService = /** @class */ (function () {
        function InitService() {
            this.subtitles = [];
        }
        InitService.prototype.getSubtitles = function () {
            return this.subtitles;
        };
        InitService.prototype.addSubtitle = function (subtitle) {
            this.subtitles.push(subtitle);
        };
        InitService.prototype.removeSubtitle = function (subtitle) {
            const index = this.subtitles.indexOf(subtitle);
            if (index !== -1) {
                this.subtitles.splice(index, 1);
            }
        };
        InitService.prototype.grantIframeApi = function (cb) {
            if (DIC.getYT() !== null) {
                cb();
                return;
            }
            const window = DIC.getWindow();
            const document = DIC.getDocument();
            waitFor(function () {
                return iframeApiLoaded(window);
            }, function () {
                DIC.setYT(window.YT);
                cb();
            });
            grantIframeApiScript(document);
        };
        InitService.prototype.grantGlobalStyles = function () {
            const document = DIC.getDocument();
            if (!globalStylesAdded(document)) {
                addGlobalStyles(document);
            }
        };
        return InitService;
    }());
    const init = function (window) {
        DIC.setWindow(window);
        DIC.setDocument(window.document);
        DIC.setInitService(new InitService());
    };

    const getCacheName = function (seconds) {
        return Math.floor(seconds / 10);
    };
    const getCacheNames = function (start, end) {
        const cacheNames = [];
        const endCacheName = getCacheName(end);
        for (let i = getCacheName(start); i <= endCacheName; i++) {
            cacheNames.push(i);
        }
        return cacheNames;
    };
    const buildCache = function (subtitles) {
        const cache = {};
        for (let _i = 0, subtitles_1 = subtitles; _i < subtitles_1.length; _i++) {
            const subtitle = subtitles_1[_i];
            for (let _a = 0, _b = getCacheNames(subtitle.start, subtitle.end); _a < _b.length; _a++) {
                const cacheName = _b[_a];
                if (!cache[cacheName]) {
                    cache[cacheName] = [];
                }
                cache[cacheName].push(subtitle);
            }
        }
        return cache;
    };
    const getSubtitleFromCache = function (seconds, builtCache) {
        if (!builtCache) {
            return null;
        }
        const cache = builtCache[getCacheName(seconds)];
        if (!cache) {
            return null;
        }
        for (let _i = 0, cache_1 = cache; _i < cache_1.length; _i++) {
            const subtitle = cache_1[_i];
            if (seconds >= subtitle.start && seconds <= subtitle.end) {
                return subtitle;
            }
        }
        return null;
    };
    const addQueryStringParameterToUrl = function (url, qsParameters) {
        const hashIndex = url.indexOf('#');
        let hash = '';
        if (hashIndex !== -1) {
            hash = url.substr(hashIndex);
            url = url.substr(0, hashIndex);
        }
        const qsIndex = url.indexOf('?');
        let qs = '';
        if (qsIndex !== -1) {
            qs = url.substr(qsIndex);
            url = url.substr(0, qsIndex);
        }
        for (let _i = 0, _a = Object.keys(qsParameters); _i < _a.length; _i++) {
            const qsParameterName = _a[_i];
            qs += '' + (qs === '' ? '?' : '&') + qsParameterName + '=' + qsParameters[qsParameterName];
        }
        return '' + url + qs + hash;
    };
    const getIframeSrc = function (src) {
        let newSrc = src;
        if (newSrc.indexOf('enablejsapi=1') === -1) {
            newSrc = addQueryStringParameterToUrl(newSrc, { enablejsapi: '1' });
        }
        if (newSrc.indexOf('html5=1') === -1) {
            newSrc = addQueryStringParameterToUrl(newSrc, { html5: '1' });
        }
        if (newSrc.indexOf('playsinline=1') === -1) {
            newSrc = addQueryStringParameterToUrl(newSrc, { playsinline: '1' });
        }
        if (newSrc.indexOf('fs=') === -1) {
            newSrc = addQueryStringParameterToUrl(newSrc, { fs: '0' });
        }
        return newSrc;
    };
    const createSubtitleElement = function (iframe, subtitle) {
        const document = DIC.getDocument();
        const element = document.createElement('div');
        element.youtubeExternalSubtitle = subtitle;
        iframe.parentNode.insertBefore(element, iframe.nextSibling);
        return element;
    };
    const isStateChanged = function (prevState, nextState) {
        for (let _i = 0, _a = Object.keys(nextState); _i < _a.length; _i++) {
            const propertyName = _a[_i];
            if (prevState[propertyName] !== nextState[propertyName]) {
                return true;
            }
        }
        return false;
    };
    const renderClassName = function (isFullscreenActive) {
        const classes = [CSS.CLASS];
        if (isFullscreenActive !== null) {
            classes.push(isFullscreenActive ? CSS.FULLSCREEN : CSS.FULLSCREEN_IGNORE);
        }
        return classes.join(' ');
    };
    const renderText = function (text) {
        return '<span>' + (text === null ? '' : text).replace(/(?:\r\n|\r|\n)/g, '</span><br /><span>') + '</span>';
    };
    const getFrameRect = function (iframe, controlsVisible) {
        const height = iframe.offsetHeight;
        return {
            x: iframe.offsetLeft - iframe.scrollLeft + iframe.clientLeft,
            y: iframe.offsetTop - iframe.scrollTop + iframe.clientTop,
            width: iframe.offsetWidth,
            height: height,
            bottomPadding: height < 200 && !controlsVisible ? 20 : 60
        };
    };
    const renderSubtitle = function (element, player, isFullscreenActive, text, controlsVisible) {
        element.className = renderClassName(isFullscreenActive);
        element.innerHTML = renderText(text);
        element.style.display = text === null ? '' : 'block';
        if (player) {
            const frame = getFrameRect(player.getIframe(), controlsVisible);
            element.style.visibility = 'hidden';
            element.style.top = frame.y + 'px';
            element.style.left = frame.x + 'px';
            element.style.maxWidth = frame.width - 20 + 'px';
            element.style.fontSize = frame.height / 260 + 'em';
            element.style.top = frame.y + frame.height - frame.bottomPadding - element.offsetHeight + 'px';
            element.style.left = frame.x + (frame.width - element.offsetWidth) / 2 + 'px';
            element.style.visibility = '';
        }
    };
    const Subtitle = /** @class */ (function () {
        function Subtitle(iframe, subtitles, renderMethod, language='en-US', rate=1.25) {
            const _this = this;
            if (subtitles === void 0) { subtitles = []; }
            if (renderMethod === void 0) { renderMethod = null; }
            this.cache = null;
            this.timeChangeInterval = 0;
            this.controlsHideTimeout = 0;
            this.player = null;
            this.videoId = null;
            this.element = null;
            this.renderMethod = null;
            this.speechDisabled = true;
            this.speechLanguage = language;
            this.speechRate = rate;
            this.state = {
                text: null,
                start: null,
                end: null,
                isFullscreenActive: null,
                controlsVisible: true
            };
            this.onTimeChange = function () {
                const subtitle = getSubtitleFromCache(_this.player.getCurrentTime(), _this.cache);
                _this.setState({
                    text: subtitle ? subtitle.text : null,
                    start: subtitle ? subtitle.start : null,
                    end: subtitle ? subtitle.end : null
                });
            };
            this.onControlsHide = function () {
                _this.setState({ controlsVisible: false });
            };
            this.onPlayerReady = function () {
                _this.videoId = _this.getCurrentVideoId();
            };
            this.onPlayerStateChange = function (e) {
                if (_this.videoId !== _this.getCurrentVideoId()) {
                    return;
                }
                const YT = DIC.getYT();
                if (e.data === YT.PlayerState.PLAYING) {
                    _this.start();
                }
                else if (e.data === YT.PlayerState.PAUSED) {
                    _this.stop();
                }
                else if (e.data === YT.PlayerState.ENDED) {
                    _this.stop();
                    _this.setState({ text: null });
                }
            };
            if (iframe.youtubeExternalSubtitle) {
                throw new Error('YoutubeExternalSubtitle: subtitle is already added for this element');
            }
            iframe.youtubeExternalSubtitle = this;
            const src = getIframeSrc(iframe.src);
            if (iframe.src !== src) {
                iframe.src = src;
            }
            this.load(subtitles);
            this.element = createSubtitleElement(iframe, this);
            this.renderMethod = renderMethod === null ? renderSubtitle : renderMethod;
            const initService = DIC.getInitService();
            initService.grantGlobalStyles();
            initService.addSubtitle(this);
            this.render();
            initService.grantIframeApi(function () {
                const YT = DIC.getYT();
                _this.player = new YT.Player(iframe);
                _this.player.addEventListener('onReady', _this.onPlayerReady);
                _this.player.addEventListener('onStateChange', _this.onPlayerStateChange);
            });
        }
        Subtitle.prototype.load = function (subtitles) {
            this.cache = buildCache(subtitles);
        };
        Subtitle.prototype.setIsFullscreenActive = function (isFullscreenActive) {
            this.setState({ isFullscreenActive: isFullscreenActive });
        };
        Subtitle.prototype.destroy = function () {
            this.stop();
            this.element.parentNode.removeChild(this.element);
            this.player.getIframe().youtubeExternalSubtitle = null;
            this.player.removeEventListener('onReady', this.onPlayerReady);
            this.player.removeEventListener('onStateChange', this.onPlayerStateChange);
            const initService = DIC.getInitService();
            initService.removeSubtitle(this);
        };
        Subtitle.prototype.render = function () {
            this.renderMethod(this.element, this.player, this.state.isFullscreenActive, this.state.text, this.state.controlsVisible);
        };
        Subtitle.prototype.speak = function (state) {
            if (this.speechDisabled) return;
            let utterance = new SpeechSynthesisUtterance(state.text);
            // Count full-width characters as two half-width characters
            let cps = state.text.replace(/[^ -~]/g, 'aa').length
                / (state.end - state.start);
            utterance.rate = cps > 15 ? this.speechRate * cps / 15 : this.speechRate;
            utterance.voice = window.speechSynthesis.getVoices().filter(item => item.lang == this.speechLanguage)[0];
            window.speechSynthesis.speak(utterance);
        };
        Subtitle.prototype.isInContainer = function (container) {
            return container.contains(this.element) || container === this.element;
        };
        Subtitle.prototype.getYTPlayer = function () {
            return this.player;
        };
        Subtitle.prototype.setState = function (state) {
            const prevState = this.state;
            const nextState = __assign(__assign({}, prevState), state);
            if (!isStateChanged(prevState, nextState)) {
                return;
            }
            this.state = nextState;
            this.render();
            if ('start' in state) this.speak(this.state);
        };
        Subtitle.prototype.start = function () {
            this.stop();
            const window = DIC.getWindow();
            this.timeChangeInterval = window.setInterval(this.onTimeChange, 500);
            this.controlsHideTimeout = window.setTimeout(this.onControlsHide, 3000);
            this.onTimeChange();
        };
        Subtitle.prototype.stop = function () {
            const window = DIC.getWindow();
            window.clearInterval(this.timeChangeInterval);
            window.clearTimeout(this.controlsHideTimeout);
            this.setState({ controlsVisible: true });
            window.speechSynthesis.cancel();
        };
        Subtitle.prototype.getCurrentVideoId = function () {
            return this.player.getVideoData().video_id;
        };
        return Subtitle;
    }());

    init(window);
    const youtube_external_subtitle = { Subtitle: Subtitle };

    return youtube_external_subtitle;

})));
