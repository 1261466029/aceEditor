import { acequire, Editor, IEditSession, Range } from 'brace';
import { v4 as uuidv4 } from 'uuid'
import { includeTheme } from '@/plugin/AceEditor';

import { EditorModesProvider, EditorThemesProvider, FreezingMarkerRange, FreezingRowsRange, ModeConfigurationOption, Page, ThemeConfigurationOption } from '.';
    
const RangeConstructor = acequire('ace/range').Range;

// check is null type
export const isNull = (target: unknown) =>
    target === undefined || target === null;

/**
 * @description at editor init or user input blur, format page title
 * @return value for (title[.suffix])
 */
export const formatPageTitle = (title: string, page: Page, passive: boolean = !0) :string => {
    const { modeConfigurationOption, defaultTitle } = page;
    const suffix = modeConfigurationOption.suffix;

    let title$ = title;
    // if title is user undefined, title = defaultTitle
    if (title === '' || isNull(title)) {
        title$ = defaultTitle ?? '';
    } 
    // else if passive = false (user action), format title
    else if(!passive) {
        const titleArr = title.split('.')
        const length = titleArr.length

        if (titleArr.length === 1) {
            title$ += suffix;
        }
        if (!titleArr[length - 1]) {
            title$ = titleArr.slice(0, length - 1).join('.') + suffix;
        }
    }

    return title$;
}

/**
 * @return the $options formatted
*/
export const formatAttrs = (attrs: Record<string, unknown>) :Record<string, unknown> =>
    Object.entries(attrs).reduce((t, [ k, v ]) => {
        const name = k.replace(/\-([a-z])/g, (_: string, key: string) => key.toLocaleUpperCase()).replace(/^[A-Z]/, (f) => f.toLocaleLowerCase());

        t[name] = v;
        return t
    }, {} as Record<string, unknown>);

// create page unique id
export const createID = () =>
    uuidv4();

// format ace editor ranges to freezing rows ranges
export const formatRanges2FreezingRowsRanges = (ranges: Range[]) :FreezingRowsRange[] =>
    ranges.map(e => [ e.start.row, e.end.row ]);

// format freezing rows ranges to ace editor ranges
export const formatFreezingRowsRanges2Ranges = (freezingRowsRanges: FreezingRowsRange[]) =>
    (freezingRowsRanges || []).map(([ l, r ]) => 
        new RangeConstructor(l, 0, r, 1)
    );

// include ace editor mode
export const includeMode = (mode: string) :string => {
    const namespace = `ace/mode/${mode}`;
    require(`brace/mode/${mode}`);

    return namespace;
}

// refresh editor freezing rows ranges marke style
export const refreshFreezingRowsRanges = (page: Page) => {
    const { session, freezing } = page;
    const { markers, ranges } = freezing;

    cleanFreezingMarkers(markers, session);
    freezing.markers = setFreezingMarkers(ranges, session);
}

// increase row number for editor freezing rows ranges
export const incFreezingRowsRange = (freezingRowsRanges: Range[], row: number, inc: number) => {
    return freezingRowsRanges.filter(range => range.start.row > row).map(range => {
        range.start.row += inc;
        range.end.row += inc;

        return range;
    });
}

// try to reset ace editor markers by freezing rows ranges
export const tryToResetFreezingMarkers = (page: Page, action: string, nl: number, nr: number) :boolean => {
    const freezingRowsRanges = page.freezing.ranges;
    const rows = Math.abs(nr - nl);
    if (rows === 0) {
        return !1;
    }

    let flag = !1;
    if (action === 'remove') {
        flag = incFreezingRowsRange(freezingRowsRanges, nr, -rows).length > 0;
    } else if (action === 'insert') {
        flag = incFreezingRowsRange(freezingRowsRanges, nl, rows).length > 0;
    }

    flag && refreshFreezingRowsRanges(page);
    return flag;
}

// clear ace editor marker of freezing rows ranges
export const cleanFreezingMarkers = (markers: FreezingMarkerRange[], session: IEditSession) => {
    markers.forEach(([ _, markerID ]) => session.removeMarker(markerID));
    return markers.splice(0);
}

// set ace editor marker of freezing rows ranges
export const setFreezingMarkers = (ranges: Range[], session: IEditSession) =>
    ranges.reduce((t, range) => {
        const markerID = session.addMarker(range, 'ace_active-line ace_readonly-line', 'fullLine', !1);

        t.push([ range, markerID ]);
        return t;
    }, [] as FreezingMarkerRange[]);

// find the rows ranges intersect of freezing rows ranges
export const findIntersectingFreezingRowsRanges = (freezingRanges: Range[], range: Range) :Range|void =>
    freezingRanges.find(freezingRange => freezingRange.intersects(range))

// filter the rows ranges intersect of freezing rows ranges
export const filterIntersectingFreezingRowsRange = (freezingRanges: Range[], range: Range) :Range[] =>
    freezingRanges.filter(freezingRange => freezingRange.intersects(range))

// format freezing rows ranges
export const formatFreezingRowsRanges = (freezingRanges: Range[]) :Range[] => {
    const tempFreezingRanges = freezingRanges as (Range|null)[];
    tempFreezingRanges.forEach(freezingRange => {
        if (freezingRange) {
            let [ nl, nr ] = [ freezingRange.start.row, freezingRange.end.row ];
            tempFreezingRanges.forEach((match, i) => {
                if (match && match !== freezingRange) {
                    let [ ol, or ] = [ match.start.row, match.end.row ];
                    if (freezingRange.intersects(match)) {
                        if (nl > ol) {
                            freezingRange.start.row = nl = ol;
                        }
                        if (nr < or) {
                            freezingRange.end.row = nr = or;
                        }

                        tempFreezingRanges[i] = null;
                    }
                }
            })
        }
    })

    return tempFreezingRanges.filter(e => !!e) as Range[];
}

// remove freezing rows ranges
export const removeFreezingRowsRanges = (freezingRanges: Range[], ... ranges: Range[]) => {
    ranges.forEach(range => {
        const [ nl, nr ] = [ range.start.row, range.end.row ];
        const [ ncl, ncr ] = [ range.start.column, range.end.column ];
        filterIntersectingFreezingRowsRange(freezingRanges, range).forEach(intersectsRange => {
            let [ ol, or ] = [ intersectsRange.start.row, intersectsRange.end.row ];
            const [ ocl, ocr ] = [ intersectsRange.start.column, intersectsRange.end.column ];
            
            const isContain = intersectsRange.containsRange(range);
            const isContained = !isContain && range.containsRange(intersectsRange);
            
            let flag = isContain || isContained;
            if (!flag) {
                if (intersectsRange.contains(nl, ocr)) {
                    or = nl - 1;
                }
                if (intersectsRange.contains(nr, ocl)) {
                    ol = nr + 1;
                }
                
                flag = or < ol;
                if (!flag) {
                    intersectsRange.start.row = ol;
                    intersectsRange.end.row = or;
                }
            }

            if (flag) {
                const index = freezingRanges.findIndex(e => e === intersectsRange);
                if (index !== -1) {
                    freezingRanges.splice(index, 1);

                    if (isContain) {
                        [ new RangeConstructor(ol, ocl, nl - 1, ncl), new RangeConstructor(nr + 1, ncr, or, ocr) ].forEach(e => {
                            if (e.start.row <= e.end.row) {
                                freezingRanges.push(e);
                            }
                        })
                    }
                }
            }
        })
    })
}

// add freezing rows ranges
export const addFreezingRowsRanges = (freezingRanges: Range[], ... ranges: Range[]) => {
    ranges.forEach(range => {
        const tempRange = range.clone();
        const [ nl, nr ] = [ range.start.row, range.end.row ];

        tempRange.start.row --;
        tempRange.end.row ++;

        const intersectsRange = findIntersectingFreezingRowsRanges(freezingRanges, tempRange);
        if (intersectsRange) {
            const [ ol, or ] = [ intersectsRange.start.row, intersectsRange.end.row ];
            const isContain = intersectsRange.containsRange(range);
            if (!isContain) {
                if (ol > nl) {
                    intersectsRange.start.row = nl
                }
                if (or < nr) {
                    intersectsRange.end.row = nr;
                }
            }
        } else {
            freezingRanges.push(range)
        }
    })
}

// include ace editor theme plugin
export const includeEditorThemePlugin = (theme: string) => {
    if (theme) {
        const themeConfigurationOption = getThemeConfigurationOption(theme);
        if (themeConfigurationOption) {
            includeEditorTheme(themeConfigurationOption)

            const namespace = createBraceUseNamespace('theme', theme)
            const { cssClass } = acequire(namespace);

            return {
                cssClass,
                namespace,
                themeConfigurationOption
            }
        }
    }
}

// init page defaultTitle
export const initPageDefaultTitle = (typeIndex: number, modeConfigurationOption: ModeConfigurationOption, defaultName: string = '') :string => {
    const suffix = modeConfigurationOption.suffix;
    const middleName = typeIndex !== 0 ? ` ${typeIndex}` : '';

    let defaultTitle = '';
    if (modeConfigurationOption) {
        if (modeConfigurationOption.defaultTitle) {
            defaultTitle = `${modeConfigurationOption.defaultTitle}${middleName}`
        } else {
            defaultTitle = `${defaultName}${middleName}${suffix}`
        }
    } else {
        defaultTitle = `${defaultName}${middleName}`;
    }

    return defaultTitle;
}

// validate page limit
export const validPageLimit = (length: number, limit: [ number, number ], inc: number, throwError: boolean = !0) :boolean => {
    const length$ = length - -inc;

    if (limit[0] >= 0 && length$ < limit[0]) {
        if (throwError) {
            throw new Error('The number of pages is less than the page-limit');
        }
        return !1;
    }

    if (limit[1] >= 0 && length$ > limit[1]) {
        if (throwError) {
            throw new Error('The number of pages is greater than the page-limit');
        }
        return !1;
    }

    return !0;
}

// include ace editor theme
export const includeEditorTheme = ({ theme, internal }: ThemeConfigurationOption) => {
    if (internal) {
        require(`brace/theme/${theme}`)
    } else {
        includeTheme(theme)
    }
}

// destory ace editor handler
export const destroyEditor = (editor: Editor) => {
    editor.destroy();
    editor.container.remove();
}

// destroy ace editor session handler
export const destroySession = (session: IEditSession) =>
    (session as any).destroy();

// destory pages handler
export const destroyPages = (pages: Page[]) :Page[] => {
    pages.forEach(page => destroyPage(page));
    return pages.splice(0);
}

// destroy page handler
export const destroyPage = ({ session, unWatchHandles }: Page) => {
    destroySession(session)
    unWatchHandles.forEach(fn => fn());
}

// set ace editor session options
export const setSessionOptions = (session: IEditSession, options: Record<string, unknown>) =>
    (session as any).setOptions(options)

// get theme configuration option
export const getThemeConfigurationOption = (theme: string) =>
    EditorThemesProvider.find((item) => item.theme === theme);

// get mode configuration option
export const getModeConfigurationOption = (mode: string) =>
    EditorModesProvider.find((item) => item.mode === mode);

// create brace use namespace
export const createBraceUseNamespace = (prev: string, value: string) :string =>
    `ace/${prev}/${value}`;
