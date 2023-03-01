export const includeTheme = (theme: string) => {
    require(`./theme/${theme}`);
    return `ace/theme/${theme}`;
}

export const themeProvider = [
    'behave'
];