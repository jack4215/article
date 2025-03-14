(function() {
    var on = addEventListener
      , off = removeEventListener
      , $ = function(q) {
        return document.querySelector(q)
    }
      , $$ = function(q) {
        return document.querySelectorAll(q)
    }
      , $body = document.body
      , $inner = $('.inner')
      , client = (function() {
        var o = {
            browser: 'other',
            browserVersion: 0,
            os: 'other',
            osVersion: 0,
            mobile: false,
            canUse: null,
            flags: {
                lsdUnits: false,
            },
        }, ua = navigator.userAgent, a, i;
        a = [['firefox', /Firefox\/([0-9\.]+)/], ['edge', /Edge\/([0-9\.]+)/], ['safari', /Version\/([0-9\.]+).+Safari/], ['chrome', /Chrome\/([0-9\.]+)/], ['chrome', /CriOS\/([0-9\.]+)/], ['ie', /Trident\/.+rv:([0-9]+)/]];
        for (i = 0; i < a.length; i++) {
            if (ua.match(a[i][1])) {
                o.browser = a[i][0];
                o.browserVersion = parseFloat(RegExp.$1);
                break;
            }
        }
        a = [['ios', /([0-9_]+) like Mac OS X/, function(v) {
            return v.replace('_', '.').replace('_', '');
        }
        ], ['ios', /CPU like Mac OS X/, function(v) {
            return 0
        }
        ], ['ios', /iPad; CPU/, function(v) {
            return 0
        }
        ], ['android', /Android ([0-9\.]+)/, null], ['mac', /Macintosh.+Mac OS X ([0-9_]+)/, function(v) {
            return v.replace('_', '.').replace('_', '');
        }
        ], ['windows', /Windows NT ([0-9\.]+)/, null], ['undefined', /Undefined/, null]];
        for (i = 0; i < a.length; i++) {
            if (ua.match(a[i][1])) {
                o.os = a[i][0];
                o.osVersion = parseFloat(a[i][2] ? (a[i][2])(RegExp.$1) : RegExp.$1);
                break;
            }
        }
        if (o.os == 'mac' && ('ontouchstart'in window) && ((screen.width == 1024 && screen.height == 1366) || (screen.width == 834 && screen.height == 1112) || (screen.width == 810 && screen.height == 1080) || (screen.width == 768 && screen.height == 1024)))
            o.os = 'ios';
        o.mobile = (o.os == 'android' || o.os == 'ios');
        var _canUse = document.createElement('div');
        o.canUse = function(property, value) {
            var style;
            style = _canUse.style;
            if (!(property in style))
                return false;
            if (typeof value !== 'undefined') {
                style[property] = value;
                if (style[property] == '')
                    return false;
            }
            return true;
        }
        ;
        o.flags.lsdUnits = o.canUse('width', '100dvw');
        return o;
    }())
      , ready = {
        list: [],
        add: function(f) {
            this.list.push(f);
        },
        run: function() {
            this.list.forEach( (f) => {
                f();
            }
            );
        },
    }
      , trigger = function(t) {
        dispatchEvent(new Event(t));
    }
      , cssRules = function(selectorText) {
        var ss = document.styleSheets, a = [], f = function(s) {
            var r = s.cssRules, i;
            for (i = 0; i < r.length; i++) {
                if (r[i]instanceof CSSMediaRule && matchMedia(r[i].conditionText).matches)
                    (f)(r[i]);
                else if (r[i]instanceof CSSStyleRule && r[i].selectorText == selectorText)
                    a.push(r[i]);
            }
        }, x, i;
        for (i = 0; i < ss.length; i++)
            f(ss[i]);
        return a;
    }
      , escapeHtml = function(s) {
        if (s === '' || s === null || s === undefined)
            return '';
        var a = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        };
        s = s.replace(/[&<>"']/g, function(x) {
            return a[x];
        });
        return s;
    }
      , thisHash = function() {
        var h = location.hash ? location.hash.substring(1) : null, a;
        if (!h)
            return null;
        if (h.match(/\?/)) {
            a = h.split('?');
            h = a[0];
            history.replaceState(undefined, undefined, '#' + h);
            window.location.search = a[1];
        }
        if (h.length > 0 && !h.match(/^[a-zA-Z]/))
            h = 'x' + h;
        if (typeof h == 'string')
            h = h.toLowerCase();
        return h;
    }
      , scrollToElement = function(e, style, duration) {
        var y, cy, dy, start, easing, offset, f;
        if (!e)
            y = 0;
        else {
            offset = (e.dataset.scrollOffset ? parseInt(e.dataset.scrollOffset) : 0) * parseFloat(getComputedStyle(document.documentElement).fontSize);
            switch (e.dataset.scrollBehavior ? e.dataset.scrollBehavior : 'default') {
            case 'default':
            default:
                y = e.offsetTop + offset;
                break;
            case 'center':
                if (e.offsetHeight < window.innerHeight)
                    y = e.offsetTop - ((window.innerHeight - e.offsetHeight) / 2) + offset;
                else
                    y = e.offsetTop - offset;
                break;
            case 'previous':
                if (e.previousElementSibling)
                    y = e.previousElementSibling.offsetTop + e.previousElementSibling.offsetHeight + offset;
                else
                    y = e.offsetTop + offset;
                break;
            }
        }
        if (!style)
            style = 'smooth';
        if (!duration)
            duration = 750;
        if (style == 'instant') {
            window.scrollTo(0, y);
            return;
        }
        start = Date.now();
        cy = window.scrollY;
        dy = y - cy;
        switch (style) {
        case 'linear':
            easing = function(t) {
                return t
            }
            ;
            break;
        case 'smooth':
            easing = function(t) {
                return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
            }
            ;
            break;
        }
        f = function() {
            var t = Date.now() - start;
            if (t >= duration)
                window.scroll(0, y);
            else {
                window.scroll(0, cy + (dy * easing(t / duration)));
                requestAnimationFrame(f);
            }
        }
        ;
        f();
    }
      , scrollToTop = function() {
        scrollToElement(null);
    }
      , loadElements = function(parent) {
        var a, e, x, i;
        a = parent.querySelectorAll('iframe[data-src]:not([data-src=""])');
        for (i = 0; i < a.length; i++) {
            a[i].contentWindow.location.replace(a[i].dataset.src);
            a[i].dataset.initialSrc = a[i].dataset.src;
            a[i].dataset.src = '';
        }
        a = parent.querySelectorAll('video[autoplay]');
        for (i = 0; i < a.length; i++) {
            if (a[i].paused)
                a[i].play();
        }
        e = parent.querySelector('[data-autofocus="1"]');
        x = e ? e.tagName : null;
        switch (x) {
        case 'FORM':
            e = e.querySelector('.field input, .field select, .field textarea');
            if (e)
                e.focus();
            break;
        default:
            break;
        }
        a = parent.querySelectorAll('unloaded-script');
        for (i = 0; i < a.length; i++) {
            x = document.createElement('script');
            x.setAttribute('data-loaded', '');
            if (a[i].getAttribute('src'))
                x.setAttribute('src', a[i].getAttribute('src'));
            if (a[i].textContent)
                x.textContent = a[i].textContent;
            a[i].replaceWith(x);
        }
        x = new Event('loadelements');
        a = parent.querySelectorAll('[data-unloaded]');
        a.forEach( (element) => {
            element.removeAttribute('data-unloaded');
            element.dispatchEvent(x);
        }
        );
    }
      , unloadElements = function(parent) {
        var a, e, x, i;
        a = parent.querySelectorAll('iframe[data-src=""]');
        for (i = 0; i < a.length; i++) {
            if (a[i].dataset.srcUnload === '0')
                continue;
            if ('initialSrc'in a[i].dataset)
                a[i].dataset.src = a[i].dataset.initialSrc;
            else
                a[i].dataset.src = a[i].src;
            a[i].contentWindow.location.replace('about:blank');
        }
        a = parent.querySelectorAll('video');
        for (i = 0; i < a.length; i++) {
            if (!a[i].paused)
                a[i].pause();
        }
        e = $(':focus');
        if (e)
            e.blur();
    };
    window._scrollToTop = scrollToTop;
    var thisUrl = function() {
        return window.location.href.replace(window.location.search, '').replace(/#$/, '');
    };
    var getVar = function(name) {
        var a = window.location.search.substring(1).split('&'), b, k;
        for (k in a) {
            b = a[k].split('=');
            if (b[0] == name)
                return b[1];
        }
        return null;
    };
    var errors = {
        handle: function(handler) {
            window.onerror = function(message, url, line, column, error) {
                (handler)(error.message);
                return true;
            }
            ;
        },
        unhandle: function() {
            window.onerror = null;
        }
    };
    var loadHandler = function() {
        setTimeout(function() {
            $body.classList.remove('is-loading');
            $body.classList.add('is-playing');
            setTimeout(function() {
                $body.classList.remove('is-playing');
                $body.classList.add('is-ready');
            }, 1000);
        }, 100);
    };
    on('load', loadHandler);
    (function() {
        var initialSection, initialScrollPoint, initialId, header, footer, name, hideHeader, hideFooter, disableAutoScroll, h, e, ee, k, locked = false, title = document.title, scrollPointParent = function(target) {
            while (target) {
                if (target.parentElement && target.parentElement.tagName == 'SECTION')
                    break;
                target = target.parentElement;
            }
            return target;
        }, scrollPointSpeed = function(scrollPoint) {
            let x = parseInt(scrollPoint.dataset.scrollSpeed);
            switch (x) {
            case 5:
                return 250;
            case 4:
                return 500;
            case 3:
                return 750;
            case 2:
                return 1000;
            case 1:
                return 1250;
            default:
                break;
            }
            return 750;
        }, doNextScrollPoint = function(event) {
            var e, target, id;
            e = scrollPointParent(event.target);
            if (!e)
                return;
            while (e && e.nextElementSibling) {
                e = e.nextElementSibling;
                if (e.dataset.scrollId) {
                    target = e;
                    id = e.dataset.scrollId;
                    break;
                }
            }
            if (!target || !id)
                return;
            if (target.dataset.scrollInvisible == '1')
                scrollToElement(target, 'smooth', scrollPointSpeed(target));
            else
                location.href = '#' + id;
        }, doPreviousScrollPoint = function(e) {
            var e, target, id;
            e = scrollPointParent(event.target);
            if (!e)
                return;
            while (e && e.previousElementSibling) {
                e = e.previousElementSibling;
                if (e.dataset.scrollId) {
                    target = e;
                    id = e.dataset.scrollId;
                    break;
                }
            }
            if (!target || !id)
                return;
            if (target.dataset.scrollInvisible == '1')
                scrollToElement(target, 'smooth', scrollPointSpeed(target));
            else
                location.href = '#' + id;
        }, doFirstScrollPoint = function(e) {
            var e, target, id;
            e = scrollPointParent(event.target);
            if (!e)
                return;
            while (e && e.previousElementSibling) {
                e = e.previousElementSibling;
                if (e.dataset.scrollId) {
                    target = e;
                    id = e.dataset.scrollId;
                }
            }
            if (!target || !id)
                return;
            if (target.dataset.scrollInvisible == '1')
                scrollToElement(target, 'smooth', scrollPointSpeed(target));
            else
                location.href = '#' + id;
        }, doLastScrollPoint = function(e) {
            var e, target, id;
            e = scrollPointParent(event.target);
            if (!e)
                return;
            while (e && e.nextElementSibling) {
                e = e.nextElementSibling;
                if (e.dataset.scrollId) {
                    target = e;
                    id = e.dataset.scrollId;
                }
            }
            if (!target || !id)
                return;
            if (target.dataset.scrollInvisible == '1')
                scrollToElement(target, 'smooth', scrollPointSpeed(target));
            else
                location.href = '#' + id;
        }, doNextSection = function() {
            var section;
            section = $('#main > .inner > section.active').nextElementSibling;
            if (!section || section.tagName != 'SECTION')
                return;
            location.href = '#' + section.id.replace(/-section$/, '');
        }, doPreviousSection = function() {
            var section;
            section = $('#main > .inner > section.active').previousElementSibling;
            if (!section || section.tagName != 'SECTION')
                return;
            location.href = '#' + (section.matches(':first-child') ? '' : section.id.replace(/-section$/, ''));
        }, doFirstSection = function() {
            var section;
            section = $('#main > .inner > section:first-of-type');
            if (!section || section.tagName != 'SECTION')
                return;
            location.href = '#' + section.id.replace(/-section$/, '');
        }, doLastSection = function() {
            var section;
            section = $('#main > .inner > section:last-of-type');
            if (!section || section.tagName != 'SECTION')
                return;
            location.href = '#' + section.id.replace(/-section$/, '');
        }, resetSectionChangeElements = function(section) {
            var ee, e, x;
            ee = section.querySelectorAll('[data-reset-on-section-change="1"]');
            for (e of ee) {
                x = e ? e.tagName : null;
                switch (x) {
                case 'FORM':
                    e.reset();
                    break;
                default:
                    break;
                }
            }
        }, activateSection = function(section, scrollPoint) {
            var sectionHeight, currentSection, currentSectionHeight, name, hideHeader, hideFooter, disableAutoScroll, ee, k;
            if (!section.classList.contains('inactive')) {
                name = (section ? section.id.replace(/-section$/, '') : null);
                disableAutoScroll = name ? ((name in sections) && ('disableAutoScroll'in sections[name]) && sections[name].disableAutoScroll) : false;
                if (scrollPoint)
                    scrollToElement(scrollPoint, 'smooth', scrollPointSpeed(scrollPoint));
                else if (!disableAutoScroll)
                    scrollToElement(null);
                return false;
            } else {
                locked = true;
                if (location.hash == '#home')
                    history.replaceState(null, null, '#');
                name = (section ? section.id.replace(/-section$/, '') : null);
                hideHeader = name ? ((name in sections) && ('hideHeader'in sections[name]) && sections[name].hideHeader) : false;
                hideFooter = name ? ((name in sections) && ('hideFooter'in sections[name]) && sections[name].hideFooter) : false;
                disableAutoScroll = name ? ((name in sections) && ('disableAutoScroll'in sections[name]) && sections[name].disableAutoScroll) : false;
                if (header && hideHeader) {
                    header.classList.add('hidden');
                    setTimeout(function() {
                        header.style.display = 'none';
                    }, 250);
                }
                if (footer && hideFooter) {
                    footer.classList.add('hidden');
                    setTimeout(function() {
                        footer.style.display = 'none';
                    }, 250);
                }
                currentSection = $('#main > .inner > section:not(.inactive)');
                if (currentSection) {
                    currentSectionHeight = currentSection.offsetHeight;
                    currentSection.classList.add('inactive');
                    document.title = title;
                    unloadElements(currentSection);
                    resetSectionChangeElements(currentSection);
                    setTimeout(function() {
                        currentSection.style.display = 'none';
                        currentSection.classList.remove('active');
                    }, 250);
                }
                if (section.dataset.title)
                    document.title = section.dataset.title + ' - ' + title;
                setTimeout(function() {
                    if (header && !hideHeader) {
                        header.style.display = '';
                        setTimeout(function() {
                            header.classList.remove('hidden');
                        }, 0);
                    }
                    if (footer && !hideFooter) {
                        footer.style.display = '';
                        setTimeout(function() {
                            footer.classList.remove('hidden');
                        }, 0);
                    }
                    section.style.display = '';
                    trigger('resize');
                    if (!disableAutoScroll)
                        scrollToElement(null, 'instant');
                    sectionHeight = section.offsetHeight;
                    if (sectionHeight > currentSectionHeight) {
                        section.style.maxHeight = currentSectionHeight + 'px';
                        section.style.minHeight = '0';
                    } else {
                        section.style.maxHeight = '';
                        section.style.minHeight = currentSectionHeight + 'px';
                    }
                    setTimeout(function() {
                        section.classList.remove('inactive');
                        section.classList.add('active');
                        section.style.minHeight = sectionHeight + 'px';
                        section.style.maxHeight = sectionHeight + 'px';
                        setTimeout(function() {
                            section.style.transition = 'none';
                            section.style.minHeight = '';
                            section.style.maxHeight = '';
                            loadElements(section);
                            if (scrollPoint)
                                scrollToElement(scrollPoint, 'instant');
                            setTimeout(function() {
                                section.style.transition = '';
                                locked = false;
                            }, 75);
                        }, 500 + 250);
                    }, 75);
                }, 250);
            }
        }, sections = {};
        window._nextScrollPoint = doNextScrollPoint;
        window._previousScrollPoint = doPreviousScrollPoint;
        window._firstScrollPoint = doFirstScrollPoint;
        window._lastScrollPoint = doLastScrollPoint;
        window._nextSection = doNextSection;
        window._previousSection = doPreviousSection;
        window._firstSection = doFirstSection;
        window._lastSection = doLastSection;
        window._scrollToTop = function() {
            var section, id;
            scrollToElement(null);
            if (!!(section = $('section.active'))) {
                id = section.id.replace(/-section$/, '');
                if (id == 'home')
                    id = '';
                history.pushState(null, null, '#' + id);
            }
        }
        ;
        if ('scrollRestoration'in history)
            history.scrollRestoration = 'manual';
        header = $('#header');
        footer = $('#footer');
        h = thisHash();
        if (h && !h.match(/^[a-zA-Z0-9\-]+$/))
            h = null;
        if (e = $('[data-scroll-id="' + h + '"]')) {
            initialScrollPoint = e;
            initialSection = initialScrollPoint.parentElement;
            initialId = initialSection.id;
        } else if (e = $('#' + (h ? h : 'home') + '-section')) {
            initialScrollPoint = null;
            initialSection = e;
            initialId = initialSection.id;
        }
        if (!initialSection) {
            initialScrollPoint = null;
            initialSection = $('#' + 'home' + '-section');
            initialId = initialSection.id;
            history.replaceState(undefined, undefined, '#');
        }
        name = (h ? h : 'home');
        hideHeader = name ? ((name in sections) && ('hideHeader'in sections[name]) && sections[name].hideHeader) : false;
        hideFooter = name ? ((name in sections) && ('hideFooter'in sections[name]) && sections[name].hideFooter) : false;
        disableAutoScroll = name ? ((name in sections) && ('disableAutoScroll'in sections[name]) && sections[name].disableAutoScroll) : false;
        if (header && hideHeader) {
            header.classList.add('hidden');
            header.style.display = 'none';
        }
        if (footer && hideFooter) {
            footer.classList.add('hidden');
            footer.style.display = 'none';
        }
        ee = $$('#main > .inner > section:not([id="' + initialId + '"])');
        for (k = 0; k < ee.length; k++) {
            ee[k].className = 'inactive';
            ee[k].style.display = 'none';
        }
        initialSection.classList.add('active');
        ready.add( () => {
            if (initialSection.dataset.title)
                document.title = initialSection.dataset.title + ' - ' + title;
            loadElements(initialSection);
            if (header)
                loadElements(header);
            if (footer)
                loadElements(footer);
            if (!disableAutoScroll)
                scrollToElement(null, 'instant');
        }
        );
        on('load', function() {
            if (initialScrollPoint)
                scrollToElement(initialScrollPoint, 'instant');
        });
        on('hashchange', function(event) {
            var section, scrollPoint, h, e;
            if (locked)
                return false;
            h = thisHash();
            if (h && !h.match(/^[a-zA-Z0-9\-]+$/))
                return false;
            if (e = $('[data-scroll-id="' + h + '"]')) {
                scrollPoint = e;
                section = scrollPoint.parentElement;
            } else if (e = $('#' + (h ? h : 'home') + '-section')) {
                scrollPoint = null;
                section = e;
            } else {
                scrollPoint = null;
                section = $('#' + 'home' + '-section');
                history.replaceState(undefined, undefined, '#');
            }
            if (!section)
                return false;
            activateSection(section, scrollPoint);
            return false;
        });
        on('click', function(event) {
            var t = event.target, tagName = t.tagName.toUpperCase(), scrollPoint, section;
            switch (tagName) {
            case 'IMG':
            case 'SVG':
            case 'USE':
            case 'U':
            case 'STRONG':
            case 'EM':
            case 'CODE':
            case 'S':
            case 'MARK':
            case 'SPAN':
                while (!!(t = t.parentElement))
                    if (t.tagName == 'A')
                        break;
                if (!t)
                    return;
                break;
            default:
                break;
            }
            if (t.tagName == 'A' && t.getAttribute('href') !== null && t.getAttribute('href').substr(0, 1) == '#') {
                if (!!(scrollPoint = $('[data-scroll-id="' + t.hash.substr(1) + '"][data-scroll-invisible="1"]'))) {
                    event.preventDefault();
                    section = scrollPoint.parentElement;
                    if (section.classList.contains('inactive')) {
                        history.pushState(null, null, '#' + section.id.replace(/-section$/, ''));
                        activateSection(section, scrollPoint);
                    } else {
                        scrollToElement(scrollPoint, 'smooth', scrollPointSpeed(scrollPoint));
                    }
                } else if (t.hash == window.location.hash) {
                    event.preventDefault();
                    history.replaceState(undefined, undefined, '#');
                    location.replace(t.hash);
                }
            }
        });
    }
    )();
    var style, sheet, rule;
    style = document.createElement('style');
    style.appendChild(document.createTextNode(''));
    document.head.appendChild(style);
    sheet = style.sheet;
    if (client.mobile) {
        (function() {
            if (client.flags.lsdUnits) {
                document.documentElement.style.setProperty('--viewport-height', '100svh');
                document.documentElement.style.setProperty('--background-height', '100lvh');
            } else {
                var f = function() {
                    document.documentElement.style.setProperty('--viewport-height', window.innerHeight + 'px');
                    document.documentElement.style.setProperty('--background-height', (window.innerHeight + 250) + 'px');
                };
                on('load', f);
                on('orientationchange', function() {
                    setTimeout(function() {
                        (f)();
                    }, 100);
                });
            }
        }
        )();
    }
    if (client.os == 'android') {
        (function() {
            sheet.insertRule('body::after { }', 0);
            rule = sheet.cssRules[0];
            var f = function() {
                rule.style.cssText = 'height: ' + (Math.max(screen.width, screen.height)) + 'px';
            };
            on('load', f);
            on('orientationchange', f);
            on('touchmove', f);
        }
        )();
        $body.classList.add('is-touch');
    } else if (client.os == 'ios') {
        if (client.osVersion <= 11)
            (function() {
                sheet.insertRule('body::after { }', 0);
                rule = sheet.cssRules[0];
                rule.style.cssText = '-webkit-transform: scale(1.0)';
            }
            )();
        if (client.osVersion <= 11)
            (function() {
                sheet.insertRule('body.ios-focus-fix::before { }', 0);
                rule = sheet.cssRules[0];
                rule.style.cssText = 'height: calc(100% + 60px)';
                on('focus', function(event) {
                    $body.classList.add('ios-focus-fix');
                }, true);
                on('blur', function(event) {
                    $body.classList.remove('ios-focus-fix');
                }, true);
            }
            )();
        $body.classList.add('is-touch');
    }
    var scrollEvents = {
        items: [],
        add: function(o) {
            this.items.push({
                element: o.element,
                triggerElement: (('triggerElement'in o && o.triggerElement) ? o.triggerElement : o.element),
                enter: ('enter'in o ? o.enter : null),
                leave: ('leave'in o ? o.leave : null),
                mode: ('mode'in o ? o.mode : 4),
                threshold: ('threshold'in o ? o.threshold : 0.25),
                offset: ('offset'in o ? o.offset : 0),
                initialState: ('initialState'in o ? o.initialState : null),
                state: false,
            });
        },
        handler: function() {
            var height, top, bottom, scrollPad;
            if (client.os == 'ios') {
                height = document.documentElement.clientHeight;
                top = document.body.scrollTop + window.scrollY;
                bottom = top + height;
                scrollPad = 125;
            } else {
                height = document.documentElement.clientHeight;
                top = document.documentElement.scrollTop;
                bottom = top + height;
                scrollPad = 0;
            }
            scrollEvents.items.forEach(function(item) {
                var elementTop, elementBottom, viewportTop, viewportBottom, bcr, pad, state, a, b;
                if (!item.enter && !item.leave)
                    return true;
                if (!item.triggerElement)
                    return true;
                if (item.triggerElement.offsetParent === null) {
                    if (item.state == true && item.leave) {
                        item.state = false;
                        (item.leave).apply(item.element);
                        if (!item.enter)
                            item.leave = null;
                    }
                    return true;
                }
                bcr = item.triggerElement.getBoundingClientRect();
                elementTop = top + Math.floor(bcr.top);
                elementBottom = elementTop + bcr.height;
                if (item.initialState !== null) {
                    state = item.initialState;
                    item.initialState = null;
                } else {
                    switch (item.mode) {
                    case 1:
                    default:
                        state = (bottom > (elementTop - item.offset) && top < (elementBottom + item.offset));
                        break;
                    case 2:
                        a = (top + (height * 0.5));
                        state = (a > (elementTop - item.offset) && a < (elementBottom + item.offset));
                        break;
                    case 3:
                        a = top + (height * (item.threshold));
                        if (a - (height * 0.375) <= 0)
                            a = 0;
                        b = top + (height * (1 - item.threshold));
                        if (b + (height * 0.375) >= document.body.scrollHeight - scrollPad)
                            b = document.body.scrollHeight + scrollPad;
                        state = (b > (elementTop - item.offset) && a < (elementBottom + item.offset));
                        break;
                    case 4:
                        pad = height * item.threshold;
                        viewportTop = (top + pad);
                        viewportBottom = (bottom - pad);
                        if (Math.floor(top) <= pad)
                            viewportTop = top;
                        if (Math.ceil(bottom) >= (document.body.scrollHeight - pad))
                            viewportBottom = bottom;
                        if ((viewportBottom - viewportTop) >= (elementBottom - elementTop)) {
                            state = ((elementTop >= viewportTop && elementBottom <= viewportBottom) || (elementTop >= viewportTop && elementTop <= viewportBottom) || (elementBottom >= viewportTop && elementBottom <= viewportBottom));
                        } else
                            state = ((viewportTop >= elementTop && viewportBottom <= elementBottom) || (elementTop >= viewportTop && elementTop <= viewportBottom) || (elementBottom >= viewportTop && elementBottom <= viewportBottom));
                        break;
                    }
                }
                if (state != item.state) {
                    item.state = state;
                    if (item.state) {
                        if (item.enter) {
                            (item.enter).apply(item.element);
                            if (!item.leave)
                                item.enter = null;
                        }
                    } else {
                        if (item.leave) {
                            (item.leave).apply(item.element);
                            if (!item.enter)
                                item.leave = null;
                        }
                    }
                }
            });
        },
        init: function() {
            on('load', this.handler);
            on('resize', this.handler);
            on('scroll', this.handler);
            (this.handler)();
        }
    };
    scrollEvents.init();
    (function() {
        var items = $$('.deferred'), loadHandler, enterHandler;
        loadHandler = function() {
            var i = this
              , p = this.parentElement;
            if (i.dataset.src !== 'done')
                return;
            if (Date.now() - i._startLoad < 375) {
                p.classList.remove('loading');
                p.style.backgroundImage = 'none';
                i.style.transition = '';
                i.style.opacity = 1;
            } else {
                p.classList.remove('loading');
                i.style.opacity = 1;
                setTimeout(function() {
                    i.style.backgroundImage = 'none';
                    i.style.transition = '';
                }, 375);
            }
        }
        ;
        enterHandler = function() {
            var i = this, p = this.parentElement, src;
            src = i.dataset.src;
            i.dataset.src = 'done';
            p.classList.add('loading');
            i._startLoad = Date.now();
            i.src = src;
        }
        ;
        items.forEach(function(p) {
            var i = p.firstElementChild;
            if (!p.classList.contains('enclosed')) {
                p.style.backgroundImage = 'url(' + i.src + ')';
                p.style.backgroundSize = '100% 100%';
                p.style.backgroundPosition = 'top left';
                p.style.backgroundRepeat = 'no-repeat';
            }
            i.style.opacity = 0;
            i.style.transition = 'opacity 0.375s ease-in-out';
            i.addEventListener('load', loadHandler);
            scrollEvents.add({
                element: i,
                enter: enterHandler,
                offset: 250,
            });
        });
    }
    )();
    function timer(id, options) {
        var _this = this, f;
        this.id = id;
        this.timestamp = options.timestamp;
        this.duration = options.duration;
        this.unit = options.unit;
        this.mode = options.mode;
        this.length = options.length;
        this.completeUrl = options.completeUrl;
        this.completion = options.completion;
        this.defer = options.defer;
        this.persistent = options.persistent;
        this.labelStyle = options.labelStyle;
        this.completed = false;
        this.status = null;
        this.$timer = document.getElementById(this.id);
        this.$parent = document.querySelector('#' + _this.$timer.id + ' ul');
        this.weeks = {
            $li: null,
            $digit: null,
            $components: null
        };
        this.days = {
            $li: null,
            $digit: null,
            $components: null
        };
        this.hours = {
            $li: null,
            $digit: null,
            $components: null
        };
        this.minutes = {
            $li: null,
            $digit: null,
            $components: null
        };
        this.seconds = {
            $li: null,
            $digit: null,
            $components: null
        };
        if (this.defer)
            this.$timer.addEventListener('loadelements', () => {
                this.init();
            }
            );
        else
            this.init();
    }
    ;timer.prototype.init = function() {
        var _this = this, kt, kd;
        kt = this.id + '-timestamp';
        kd = this.id + '-duration';
        switch (this.mode) {
        case 'duration':
            this.timestamp = parseInt(Date.now() / 1000) + this.duration;
            if (this.persistent) {
                if (registry.get(kd) != this.duration)
                    registry.unset(kt);
                registry.set(kd, this.duration);
                if (registry.exists(kt))
                    this.timestamp = parseInt(registry.get(kt));
                else
                    registry.set(kt, this.timestamp);
            } else {
                if (registry.exists(kt))
                    registry.unset(kt);
                if (registry.exists(kd))
                    registry.unset(kd);
            }
            break;
        default:
            break;
        }
        window.setInterval(function() {
            _this.updateDigits();
            _this.updateSize();
        }, 250);
        this.updateDigits();
        on('resize', function() {
            _this.updateSize();
        });
        this.updateSize();
    }
    ;
    timer.prototype.updateSize = function() {
        var $items, $item, $digit, $components, $component, $label, $sublabel, $symbols, w, iw, h, f, i, j, found;
        $items = document.querySelectorAll('#' + this.$timer.id + ' ul li .item');
        $symbols = document.querySelectorAll('#' + this.$timer.id + ' .symbol');
        $components = document.querySelectorAll('#' + this.$timer.id + ' .component');
        h = 0;
        f = 0;
        for (j = 0; j < $components.length; j++) {
            $components[j].style.lineHeight = '';
            $components[j].style.height = '';
        }
        for (j = 0; j < $symbols.length; j++) {
            $symbols[j].style.fontSize = '';
            $symbols[j].style.lineHeight = '';
            $symbols[j].style.height = '';
        }
        for (i = 0; i < $items.length; i++) {
            $item = $items[i];
            $component = $item.children[0].children[0];
            w = $component.offsetWidth;
            iw = $item.offsetWidth;
            $digit = $item.children[0];
            $digit.style.fontSize = '';
            $digit.style.fontSize = (w * 1.65) + 'px';
            h = Math.max(h, $digit.offsetHeight);
            f = Math.max(f, (w * 1.65));
            if ($item.children.length > 1) {
                $label = $item.children[1];
                found = false;
                for (j = 0; j < $label.children.length; j++) {
                    $sublabel = $label.children[j];
                    $sublabel.style.display = '';
                    if (!found && $sublabel.offsetWidth < iw) {
                        found = true;
                        $sublabel.style.display = '';
                    } else
                        $sublabel.style.display = 'none';
                }
            }
        }
        if ($items.length == 1) {
            var x = $items[0].children[0]
              , xs = getComputedStyle(x)
              , xsa = getComputedStyle(x, ':after');
            if (xsa.content != 'none')
                h = parseInt(xsa.height) - parseInt(xs.marginTop) - parseInt(xs.marginBottom) + 24;
        }
        for (j = 0; j < $components.length; j++) {
            $components[j].style.lineHeight = h + 'px';
            $components[j].style.height = h + 'px';
        }
        for (j = 0; j < $symbols.length; j++) {
            $symbols[j].style.fontSize = (f * 0.5) + 'px';
            $symbols[j].style.lineHeight = h + 'px';
            $symbols[j].style.height = h + 'px';
        }
        this.$parent.style.height = '';
        this.$parent.style.height = this.$parent.offsetHeight + 'px';
    }
    ;
    timer.prototype.updateDigits = function() {
        var _this = this, x = [{
            class: 'weeks',
            digit: 0,
            divisor: 604800,
            label: {
                full: 'Weeks',
                abbreviated: 'Wks',
                initialed: 'W'
            }
        }, {
            class: 'days',
            digit: 0,
            divisor: 86400,
            label: {
                full: 'Days',
                abbreviated: 'Days',
                initialed: 'D'
            }
        }, {
            class: 'hours',
            digit: 0,
            divisor: 3600,
            label: {
                full: 'Hours',
                abbreviated: 'Hrs',
                initialed: 'H'
            }
        }, {
            class: 'minutes',
            digit: 0,
            divisor: 60,
            label: {
                full: 'Minutes',
                abbreviated: 'Mins',
                initialed: 'M'
            }
        }, {
            class: 'seconds',
            digit: 0,
            divisor: 1,
            label: {
                full: 'Seconds',
                abbreviated: 'Secs',
                initialed: 'S'
            }
        }, ], now, diff, zeros, status, i, j, x, z, t, s;
        now = parseInt(Date.now() / 1000);
        switch (this.mode) {
        case 'countdown':
        case 'duration':
            if (this.timestamp >= now)
                diff = this.timestamp - now;
            else {
                diff = 0;
                if (!this.completed) {
                    this.completed = true;
                    if (this.completion)
                        (this.completion)();
                    if (this.completeUrl)
                        window.setTimeout(function() {
                            window.location.href = _this.completeUrl;
                        }, 1000);
                }
            }
            break;
        case 'countup':
            diff = Math.max(0, now - this.timestamp);
            break;
        default:
        case 'default':
            if (this.timestamp >= now)
                diff = this.timestamp - now;
            else
                diff = now - this.timestamp;
            break;
        }
        switch (this.unit) {
        case 'weeks':
            break;
        case 'days':
            x = x.slice(1);
            break;
        case 'hours':
            x = x.slice(2);
            break;
        default:
            break;
        }
        for (i = 0; i < x.length; i++) {
            x[i].digit = Math.floor(diff / x[i].divisor);
            diff -= x[i].digit * x[i].divisor;
        }
        zeros = 0;
        for (i = 0; i < x.length; i++)
            if (x[i].digit == 0)
                zeros++;
            else
                break;
        while (zeros > 0 && x.length > this.length) {
            x.shift();
            zeros--;
        }
        z = [];
        for (i = 0; i < x.length; i++)
            z.push(x[i].class);
        status = z.join('-');
        if (status == this.status) {
            var $digit, $components;
            for (i = 0; i < x.length; i++) {
                $digit = document.querySelector('#' + this.id + ' .' + x[i].class + ' .digit');
                $components = document.querySelectorAll('#' + this.id + ' .' + x[i].class + ' .digit .component');
                if (!$digit)
                    continue;
                z = [];
                t = String(x[i].digit);
                if (x[i].digit < 10) {
                    z.push('0');
                    z.push(t);
                } else
                    for (j = 0; j < t.length; j++)
                        z.push(t.substr(j, 1));
                $digit.classList.remove('count1', 'count2', 'count3', 'count4', 'count5');
                $digit.classList.add('count' + z.length);
                if ($components.length == z.length) {
                    for (j = 0; j < $components.length && j < z.length; j++)
                        $components[j].innerHTML = z[j];
                } else {
                    s = '';
                    for (j = 0; j < $components.length && j < z.length; j++)
                        s += '<span class="component x' + Math.random() + '">' + z[j] + '</span>';
                    $digit.innerHTML = s;
                }
            }
        } else {
            s = '';
            for (i = 0; i < x.length && i < this.length; i++) {
                z = [];
                t = String(x[i].digit);
                if (x[i].digit < 10) {
                    z.push('0');
                    z.push(t);
                } else
                    for (j = 0; j < t.length; j++)
                        z.push(t.substr(j, 1));
                if (i > 0)
                    s += '<li class="delimiter">' + '<span class="symbol">:</span>' + '</li>';
                s += '<li class="number ' + x[i].class + '">' + '<div class="item">';
                s += '<span class="digit count' + t.length + '">';
                for (j = 0; j < z.length; j++)
                    s += '<span class="component">' + z[j] + '</span>';
                s += '</span>';
                switch (this.labelStyle) {
                default:
                case 'full':
                    s += '<span class="label">' + '<span class="full">' + x[i].label.full + '</span>' + '<span class="abbreviated">' + x[i].label.abbreviated + '</span>' + '<span class="initialed">' + x[i].label.initialed + '</span>' + '</span>';
                    break;
                case 'abbreviated':
                    s += '<span class="label">' + '<span class="abbreviated">' + x[i].label.abbreviated + '</span>' + '<span class="initialed">' + x[i].label.initialed + '</span>' + '</span>';
                    break;
                case 'initialed':
                    s += '<span class="label">' + '<span class="initialed">' + x[i].label.initialed + '</span>' + '</span>';
                    break;
                case 'none':
                    break;
                }
                s += '</div>' + '</li>';
            }
            _this.$parent.innerHTML = s;
            this.status = status;
        }
    }
    ;
    new timer('timer01',{
        mode: 'default',
        length: 4,
        unit: 'days',
        completeUrl: '',
        timestamp: 1732720380,
        labelStyle: 'full'
    });
    ready.run();
}
)();